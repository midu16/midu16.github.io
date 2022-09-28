---
layout: post
title:  "Offline Assisted Installer on Openshift 4!"
date:   2022-09-26 10:10:29 +0200
categories: openshift4
---
In the following post, we are going to talk on how to deploy all the Offline Assisted Installer for OCPv4.10.25.

Prerequisites

- skopeo cli available.
- podman cli available.  For more information on how to [install container tools][container-tools].
- [offline registry][offline-registry].
- internet connection (through a proxy).

[offline-registry]: https://midu16.github.io/openshift4/2022/07/10/offline-mirroring.html

Step 1. Mirroring the OpenShift Assisted Installer Service

- Mirroring the container base images:
{% highlight bash %}
PULL_SECRET_PATH=${HOME}/pull-secret.json
LOCAL_REGISTRY=INBACRNRDL0100.offline.oxtechnix.lan
oc -a ${PULL_SECRET_PATH} image mirror docker.io/library/haproxy:latest ${LOCAL_REGISTRY}:5000/library/haproxy:latest --insecure
oc -a ${PULL_SECRET_PATH} image mirror docker.io/library/nginx:latest ${LOCAL_REGISTRY}:5000/library/nginx:latest --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/coreos/coreos-installer:latest ${LOCAL_REGISTRY}:5000/coreos/coreos-installer:latest --insecure

oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/postgresql-12-centos7:latest ${LOCAL_REGISTRY}:5000/ocpmetal/postgresql-12-centos7:latest --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/ocp-metal-ui:latest ${LOCAL_REGISTRY}:5000/ocpmetal/ocp-metal-ui:latest --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/agent:latest ${LOCAL_REGISTRY}:5000/ocpmetal/agent:latest --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/assisted-installer-agent:latest ${LOCAL_REGISTRY}:5000/ocpmetal/assisted-installer-agent:latest --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/assisted-iso-create:latest ${LOCAL_REGISTRY}:5000/ocpmetal/assisted-iso-create:latest --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/assisted-installer:latest ${LOCAL_REGISTRY}:5000/ocpmetal/assisted-installer:latest --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/assisted-installer-controller:latest ${LOCAL_REGISTRY}:5000/ocpmetal/assisted-installer-controller:latest --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/assisted-service:latest ${LOCAL_REGISTRY}:5000/ocpmetal/assisted-service:latest --insecure

oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/ocp-metal-ui:stable ${LOCAL_REGISTRY}:5000/ocpmetal/ocp-metal-ui:stable --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/assisted-iso-create:stable ${LOCAL_REGISTRY}:5000/ocpmetal/assisted-iso-create:stable --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/assisted-installer:stable ${LOCAL_REGISTRY}:5000/ocpmetal/assisted-installer:stable --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/assisted-installer-controller:stable ${LOCAL_REGISTRY}:5000/ocpmetal/assisted-installer-controller:stable --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/ocpmetal/assisted-service:stable ${LOCAL_REGISTRY}:5000/ocpmetal/assisted-service:stable --insecure

oc -a ${PULL_SECRET_PATH} image mirror quay.io/edge-infrastructure/assisted-installer-agent:stable ${LOCAL_REGISTRY}:5000/edge-infrastructure/assisted-installer-agent:stable --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/edge-infrastructure/assisted-installer:stable ${LOCAL_REGISTRY}:5000/edge-infrastructure/assisted-installer:stable --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/edge-infrastructure/assisted-installer-controller:stable ${LOCAL_REGISTRY}:5000/edge-infrastructure/assisted-installer-controller:stable --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/edge-infrastructure/assisted-service:stable ${LOCAL_REGISTRY}:5000/edge-infrastructure/assisted-service:stable --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/edge-infrastructure/assisted-image-service:stable ${LOCAL_REGISTRY}:5000/edge-infrastructure/assisted-image-service:stable --insecure
oc -a ${PULL_SECRET_PATH} image mirror quay.io/edge-infrastructure/assisted-installer-ui:stable ${LOCAL_REGISTRY}:5000/edge-infrastructure/assisted-installer-ui:stable --insecure
{% endhighlight %}

- Validating the content of the Offline registry:
{% highlight bash %}
curl -X GET -u <username>:<password> https://INBACRNRDL0100.offline.oxtechnix.lan:5000/v2/_catalog --insecure | jq .
{
  "repositories": [
    "centos7/httpd-24-centos7",
    "coreos/butane",
    "coreos/coreos-installer",
    "edge-infrastructure/assisted-image-service",
    "edge-infrastructure/assisted-installer",
    "edge-infrastructure/assisted-installer-agent",
    "edge-infrastructure/assisted-installer-controller",
    "edge-infrastructure/assisted-installer-ui",
    "edge-infrastructure/assisted-service",
    "library/haproxy",
    "library/nginx",
    "ocpmetal/agent",
    "ocpmetal/assisted-installer",
    "ocpmetal/assisted-installer-agent",
    "ocpmetal/assisted-installer-controller",
    "ocpmetal/assisted-iso-create",
    "ocpmetal/assisted-service",
    "ocpmetal/ocp-metal-ui",
    "ocpmetal/postgresql-12-centos7"
  ]
}
{% endhighlight %}

Step 2. OpenShift and Assisted Installer Service Configuration Files

- Creating the path:
{% highlight bash %}
export MIRROR_BASE_PATH=/apps
mkdir -p $MIRROR_BASE_PATH/{mirror-ingress/{haproxy,nginx/templates/,scripts}/,ai-svc/{local-store,volumes/{db,opt,imgsvc}}/,auth,dns,pki,downloads/{images,olm,rhcos,tools}}
{% endhighlight %}

- Validating that the proper path has been created:
{% highlight bash %}
tree mirror-ingress/
mirror-ingress/
├── haproxy
├── nginx
│   └── templates
└── scripts

4 directories, 0 files

tree ai-svc/
ai-svc/
├── cluster-versions.json
├── local-store
└── volumes
    ├── db
    ├── imgsvc
    └── opt

5 directories, 1 file

{% endhighlight %}

In order to interact with the RH APIs you need an [Offline Token][offline-token-api].

[offline-token-api]: https://access.redhat.com/management/api

Save the Offline Token to a file in the Mirror VM at `/apps/mirror-ingress/rh-api-offline-token`.
{% highlight bash %}
RH_OFFLINE_TOKEN=$(cat /apps/mirror-ingress/rh-api-offline-token)
export ACCESS_TOKEN=$(curl -s --fail https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token -d grant_type=refresh_token -d client_id=rhsm-api -d refresh_token=$RH_OFFLINE_TOKEN | jq .access_token  | tr -d '"')
QUERY_CLUSTER_VERSIONS_REQUEST=$(curl -s --fail --header "Authorization: Bearer $ACCESS_TOKEN" --header "Content-Type: application/json" --header "Accept: application/json" --request GET "https://api.openshift.com/api/assisted-install/v2/openshift-versions")
echo $QUERY_CLUSTER_VERSIONS_REQUEST > ${MIRROR_BASE_PATH}/ai-svc/cluster-versions.json
{% endhighlight %}

- Checking the `cluster-versions.json` file content:
{% highlight json %}
echo $QUERY_CLUSTER_VERSIONS_REQUEST | jq .
{
  "4.10": {
    "cpu_architectures": [
      "x86_64",
      "arm64"
    ],
    "display_name": "4.10.30",
    "support_level": "production"
  },
  "4.11": {
    "cpu_architectures": [
      "x86_64",
      "arm64"
    ],
    "default": true,
    "display_name": "4.11.5",
    "support_level": "production"
  },
  "4.11.1": {
    "cpu_architectures": [
      "x86_64",
      "arm64"
    ],
    "display_name": "4.11.1",
    "support_level": "production"
  },
  "4.12": {
    "cpu_architectures": [
      "arm64",
      "x86_64"
    ],
    "display_name": "4.12.0-ec.3",
    "support_level": "beta"
  },
  "4.8": {
    "cpu_architectures": [
      "x86_64"
    ],
    "display_name": "4.8.46",
    "support_level": "production"
  },
  "4.8.12": {
    "cpu_architectures": [
      "x86_64"
    ],
    "display_name": "4.8.12",
    "support_level": "production"
  },
  "4.8.29": {
    "cpu_architectures": [
      "x86_64"
    ],
    "display_name": "4.8.29",
    "support_level": "production"
  },
  "4.8.36": {
    "cpu_architectures": [
      "x86_64"
    ],
    "display_name": "4.8.36",
    "support_level": "production"
  },
  "4.8.39": {
    "cpu_architectures": [
      "x86_64"
    ],
    "display_name": "4.8.39",
    "support_level": "production"
  },
  "4.9": {
    "cpu_architectures": [
      "x86_64"
    ],
    "display_name": "4.9.43",
    "support_level": "production"
  },
  "4.9.13": {
    "cpu_architectures": [
      "x86_64"
    ],
    "display_name": "4.9.13",
    "support_level": "production"
  },
  "4.9.17": {
    "cpu_architectures": [
      "x86_64"
    ],
    "display_name": "4.9.17",
    "support_level": "production"
  },
  "4.9.25": {
    "cpu_architectures": [
      "x86_64"
    ],
    "display_name": "4.9.25",
    "support_level": "production"
  },
  "4.9.37": {
    "cpu_architectures": [
      "x86_64"
    ],
    "display_name": "4.9.37",
    "support_level": "production"
  },
  "4.9.9": {
    "cpu_architectures": [
      "x86_64"
    ],
    "display_name": "4.9.9",
    "support_level": "production"
  }
}
{% endhighlight %}

- Assisted Installer Service Config

{% highlight bash %}
## Create the Nginx configuration file
cat > $MIRROR_BASE_PATH/ai-svc/volumes/opt/nginx-ui.conf <<EOF
server {
  listen 0.0.0.0:8989;
  server_name _;
  root /app;
  index index.html;
  location /api {
      proxy_pass http://localhost:8090;
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host \$host;
      proxy_cache_bypass \$http_upgrade;
  }
  location / {
     try_files \$uri /index.html;
  }
}
EOF

## Create Assisted Installer Configuration
cat > $MIRROR_BASE_PATH/ai-svc/volumes/opt/onprem-environment <<EOF
#This is the IP or name with the API the OCP discovery agent will callback
SERVICE_FQDN="assisted-installer.${ISOLATED_NETWORK_DOMAIN}"

SERVICE_BASE_URL=http://127.0.0.1:8090
ASSISTED_SERVICE_SCHEME=http
ASSISTED_SERVICE_HOST=127.0.0.1:8090
IMAGE_SERVICE_BASE_URL=http://127.0.0.1:8888
LISTEN_PORT=8888

# Required when using self-signed certifications or no certificates
SKIP_CERT_VERIFICATION=true

DEPLOY_TARGET=onprem
DUMMY_IGNITION=false
STORAGE=filesystem
DISK_ENCRYPTION_SUPPORT=true
NTP_DEFAULT_SERVER=
IPV6_SUPPORT=false
AUTH_TYPE=none

POSTGRESQL_DATABASE=installer
POSTGRESQL_PASSWORD=admin
POSTGRESQL_USER=admin
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=admin
DB_PASS=admin
DB_NAME=installer

# Uncomment to avoid pull-secret requirement for quay.io on restricted network installs
PUBLIC_CONTAINER_REGISTRIES="quay.io,registry.access.redhat.com,registry.redhat.io,$LOCAL_REGISTRY"

OPENSHIFT_VERSIONS=$(cat ${MIRROR_BASE_PATH}/ai-svc/openshift_versions.json)
OS_IMAGES=$(cat ${MIRROR_BASE_PATH}/downloads/rhcos/os_images.json)
RELEASE_IMAGES=$(cat ${MIRROR_BASE_PATH}/downloads/rhcos/release_images.json)

HW_VALIDATOR_REQUIREMENTS=[{"version":"default","master":{"cpu_cores":4,"ram_mib":16384,"disk_size_gb":120,"installation_disk_speed_threshold_ms":10,"network_latency_threshold_ms":100,"packet_loss_percentage":0},"worker":{"cpu_cores":2,"ram_mib":8192,"disk_size_gb":120,"installation_disk_speed_threshold_ms":10,"network_latency_threshold_ms":1000,"packet_loss_percentage":10},"sno":{"cpu_cores":8,"ram_mib":32768,"disk_size_gb":120,"installation_disk_speed_threshold_ms":10}}]

# Enabled for SNO Deployments
ENABLE_SINGLE_NODE_DNSMASQ=true
EOF
{% endhighlight %}

- Modified install-config.yaml

{% highlight bash %}
## Create an example install-config.yaml
cat > $MIRROR_BASE_PATH/example-install-config.yaml <<EOF
apiVersion: v1
baseDomain: oxtechnix.lan
controlPlane:
  name: master
  hyperthreading: Disabled
  replicas: 3
compute:
- name: worker
  hyperthreading: Disabled
  replicas: 3
metadata:
  name: test-cluster
networking:
  networkType: OpenShiftSDN
  clusterNetworks:
  - cidr: 10.128.0.0/14
    hostPrefix: 23
  machineNetwork:
  - cidr: 172.18.0.0/16
  serviceNetwork:
  - 172.30.0.0/16
platform:
  none: {}
fips: false
sshKey: 'ssh-rsa kjhf9dfkjf...YOUR_SSH_KEY_HERE...'
pullSecret: '<pull_secret_content>'
additionalTrustBundle: |
  $(cat /apps/registry/certs/ca.cert.pem | sed 's/^/  /')
$(cat /apps/registry/image_content_sources.yaml)
EOF
{% endhighlight %}

- Nginx Server

{% highlight bash %}
cat > /apps/registry/nginx/templates/default.conf.template <<EOF
server {
    listen       8989;
    server_name  _;

    location / {
        root   /usr/share/nginx/html;
        index mirror-index.html;
        autoindex on;
        autoindex_format html;
        autoindex_exact_size off;
        autoindex_localtime on;
    }
}
EOF
{% endhighlight %}

- HAProxy Reverse Proxy

{% highlight bash %}
## Set some variables
MIRROR_VM_ISOLATED_BRIDGE_IFACE_IP="192.168.50.7"
ISOLATED_AI_SVC_NGINX_IP="192.168.50.14"
ISOLATED_AI_SVC_ENDPOINT_IP="192.168.50.11"

ISOLATED_NETWORK_DOMAIN="oxtechnix.lan"

ISOLATED_AI_SVC_API_HOSTNAME="ai-api"
ISOLATED_AI_SVC_WEB_UI_HOSTNAME="ai-web"
ISOLATED_AI_SVC_ENDPOINT="assisted-installer"

## Create the CRT List for HAProxy
cat > $MIRROR_BASE_PATH/mirror-ingress/haproxy/crt-list.cfg <<EOF
/usr/local/etc/certs/isolated-wildcard.haproxy-bundle.pem
EOF

## Create the HAProxy Configuration file
cat > $MIRROR_BASE_PATH/mirror-ingress/haproxy/haproxy.cfg <<EOF
global
  log stdout format raw local0
  daemon
  ssl-default-bind-ciphers kEECDH+aRSA+AES:kRSA+AES:+AES256:RC4-SHA:!kEDH:!LOW:!EXP:!MD5:!aNULL:!eNULL

resolvers docker_resolver
  nameserver dns $MIRROR_VM_ISOLATED_BRIDGE_IFACE_IP:53

defaults
  log     global
  mode    http
  option  httplog
  option  dontlognull
  timeout connect 36000s
  timeout client 36000s
  timeout server 36000s

frontend http
  bind *:80
  mode http
  acl is_well_known path_beg -i /.well-known/
  redirect scheme https code 301 if !is_well_known !{ ssl_fc }

frontend https
  mode tcp
  bind *:443 ssl crt-list /usr/local/etc/haproxy/crt-list.cfg

  acl host_ai_svc_api hdr(host) -i $ISOLATED_AI_SVC_API_HOSTNAME.$ISOLATED_NETWORK_DOMAIN
  acl host_ai_svc_web hdr(host) -i $ISOLATED_AI_SVC_WEB_UI_HOSTNAME.$ISOLATED_NETWORK_DOMAIN
  acl host_ai_svc_endpoint hdr(host) -i $ISOLATED_AI_SVC_ENDPOINT.$ISOLATED_NETWORK_DOMAIN
  acl host_registry hdr(host) -i registry.$ISOLATED_NETWORK_DOMAIN
  acl host_mirror hdr(host) -i mirror.$ISOLATED_NETWORK_DOMAIN

  use_backend aiwebui if host_ai_svc_web
  use_backend aiwebui if host_ai_svc_endpoint
  use_backend aiapi if host_ai_svc_api
  use_backend registry if host_registry
  use_backend mirrorhttp if host_mirror

  default_backend mirrorhttp

backend mirrorhttp
  mode http
  server backend1 $ISOLATED_AI_SVC_NGINX_IP:8989
  http-request add-header X-Forwarded-Proto https if { ssl_fc }
  http-response set-header Strict-Transport-Security "max-age=16000000; includeSubDomains; preload;"

backend registry
  mode tcp
  server registry1 $MIRROR_VM_ISOLATED_BRIDGE_IFACE_IP:443

backend aiapi
  mode http
  server aiapi1 $ISOLATED_AI_SVC_ENDPOINT_IP:8090
  http-request add-header X-Forwarded-Proto https if { ssl_fc }
  http-response set-header Strict-Transport-Security "max-age=16000000; includeSubDomains; preload;"

backend aiwebui
  mode http
  server aiwebui1 $ISOLATED_AI_SVC_ENDPOINT_IP:8989
  http-request add-header X-Forwarded-Proto https if { ssl_fc }
  http-response set-header Strict-Transport-Security "max-age=16000000; includeSubDomains; preload;"
EOF
{% endhighlight %}

Step 3. Starting the Container Services

{% highlight bash %}
## Set some variables
## DEFAULT_VERSION was set after the mirroring loop was run
DEFAULT_VERSION="4.9.9"

## Set the path for our combined Pull Secret from the last step
PULL_SECRET_PATH="${MIRROR_BASE_PATH}/auth/compiled-pull-secret.json"
## LOCAL_REGISTRY is the FQDN or other resolvable endpoint for the mirrored container registry
LOCAL_REGISTRY="${MIRROR_VM_HOSTNAME}.${ISOLATED_NETWORK_DOMAIN}"

ISOLATED_NETWORK_DOMAIN="isolated.local"
ISOLATED_AI_SVC_API_HOSTNAME="ai-api"
ISOLATED_AI_SVC_WEB_UI_HOSTNAME="ai-web"
ISOLATED_AI_SVC_DB_HOSTNAME="ai-db"
ISOLATED_AI_SVC_IMAGE_HOSTNAME="ai-image"
ISOLATED_AI_SVC_ENDPOINT="assisted-installer"
ISOLATED_AI_SVC_ENDPOINT_IP="192.168.50.11"
ISOLATED_AI_SVC_HAPROXY_IP="192.168.50.13"
ISOLATED_AI_SVC_NGINX_IP="192.168.50.14"

MIRROR_VM_ISOLATED_BRIDGE_IFACE="bridge0"
MIRROR_VM_ISOLATED_BRIDGE_IFACE_IP="192.168.50.7"

## Start the Nginx HTTP Server
podman run -dt --name mirror-websrv \
 --network $MIRROR_VM_ISOLATED_BRIDGE_IFACE --ip "${ISOLATED_AI_SVC_NGINX_IP}" -p 8080/tcp \
 -m 1024m \
 -e "NGINX_PORT=8080" \
 --authfile ${PULL_SECRET_PATH} \
 -v ${MIRROR_BASE_PATH}/downloads:/usr/share/nginx/html/pub/downloads \
 -v ${MIRROR_BASE_PATH}/mirror-ingress/nginx/templates:/etc/nginx/templates \
 $LOCAL_REGISTRY/library/nginx:latest

## Start HAProxy
podman run -dt --sysctl net.ipv4.ip_unprivileged_port_start=0 \
 --name mirror-ingress -m 1024m \
 --network $MIRROR_VM_ISOLATED_BRIDGE_IFACE --ip "${ISOLATED_AI_SVC_HAPROXY_IP}" -p 80/tcp -p 443/tcp \
 --authfile ${PULL_SECRET_PATH} \
 -v ${MIRROR_BASE_PATH}/mirror-ingress/haproxy:/usr/local/etc/haproxy:ro \
 -v ${MIRROR_BASE_PATH}/pki:/usr/local/etc/certs:ro \
 $LOCAL_REGISTRY/library/haproxy:latest

## Preset the needed assets for OAS
### Copy the RHCOS live CD
if [ ! -f "${MIRROR_BASE_PATH}/ai-svc/local-store/rhcos-live.x86_64.iso" ]; then
  cp ${MIRROR_BASE_PATH}/downloads/rhcos/${DEFAULT_VERSION}/rhcos-live.x86_64.iso ${MIRROR_BASE_PATH}/ai-svc/local-store/rhcos-live.x86_64.iso
fi
### Copy the RHCOS installer
if [ ! -f "$MIRROR_BASE_PATH/ai-svc/local-store/coreos-installer" ]; then
  podman run -it --rm --authfile ${PULL_SECRET_PATH} \
    -v ${MIRROR_BASE_PATH}/ai-svc/local-store:/data \
    -w /data \
    --entrypoint /bin/bash \
    $LOCAL_REGISTRY/coreos/coreos-installer:v0.10.0 \
    -c 'cp /usr/sbin/coreos-installer /data/coreos-installer'
fi

## Create the Assisted Installer Service Pod
podman pod create --name $ISOLATED_AI_SVC_ENDPOINT \
 -p 5432:5432,8080:8080,8090:8090,8888:8888 \
 --network "${MIRROR_VM_ISOLATED_BRIDGE_IFACE}" \
 --ip "${ISOLATED_AI_SVC_ENDPOINT_IP}" \
 --dns "${MIRROR_VM_ISOLATED_BRIDGE_IFACE_IP}" \
 --dns-search "${ISOLATED_NETWORK_DOMAIN}"

## Prepare for DB persistence
### NOTE: Make sure to delete this directory if persistence is not desired for a new environment!
mkdir -p ${MIRROR_BASE_PATH}/ai-svc/volumes/db
chown -R 26 ${MIRROR_BASE_PATH}/ai-svc/volumes/db

## Start the OAS Database
podman run -dt --pod $ISOLATED_AI_SVC_ENDPOINT --name $ISOLATED_AI_SVC_DB_HOSTNAME \
  -m 512m \
  --restart unless-stopped \
  --authfile ${PULL_SECRET_PATH} \
  --env-file ${MIRROR_BASE_PATH}/ai-svc/volumes/opt/onprem-environment \
  -v ${MIRROR_BASE_PATH}/ai-svc/volumes/db:/var/lib/pgsql:z \
  $LOCAL_REGISTRY/ocpmetal/postgresql-12-centos7:latest

## Start the OAS Image Service
podman run -dt --pod $ISOLATED_AI_SVC_ENDPOINT --name $ISOLATED_AI_SVC_IMAGE_HOSTNAME \
  -m 1024m \
  --restart unless-stopped \
  --authfile ${PULL_SECRET_PATH} \
  --env-file $MIRROR_BASE_PATH/ai-svc/volumes/opt/onprem-environment \
  -v $MIRROR_BASE_PATH/ai-svc/volumes/imgsvc:/data:z \
  -v $MIRROR_BASE_PATH/downloads/ca.cert.pem:/etc/pki/ca-trust/source/anchors/ca.cert.pem:z \
  --entrypoint='["/bin/bash", "-c", "update-ca-trust; /assisted-image-service"]' \
  $LOCAL_REGISTRY/edge-infrastructure/assisted-image-service:stable

## Start the OAS API
podman run -dt --pod $ISOLATED_AI_SVC_ENDPOINT --name $ISOLATED_AI_SVC_API_HOSTNAME \
  -m 1024m \
  --restart unless-stopped \
  --authfile ${PULL_SECRET_PATH} \
  --env-file $MIRROR_BASE_PATH/ai-svc/volumes/opt/onprem-environment \
  -e DUMMY_IGNITION=False \
  -v $MIRROR_BASE_PATH/ai-svc/local-store/rhcos-live.x86_64.iso:/data/livecd.iso:z \
  -v $MIRROR_BASE_PATH/ai-svc/local-store/coreos-installer:/data/coreos-installer:z \
  -v $MIRROR_BASE_PATH/downloads/ca.cert.pem:/etc/pki/ca-trust/source/anchors/ca.cert.pem:z \
  --entrypoint='["/bin/bash", "-c", "update-ca-trust; /assisted-service"]' \
  $LOCAL_REGISTRY/ocpmetal/assisted-service:latest

## Start the OAS WebUI
podman run -dt --pod $ISOLATED_AI_SVC_ENDPOINT --name $ISOLATED_AI_SVC_WEB_UI_HOSTNAME \
  -m 512m \
  --restart unless-stopped \
  --authfile ${PULL_SECRET_PATH} \
  --env-file $MIRROR_BASE_PATH/ai-svc/volumes/opt/onprem-environment \
  -v $MIRROR_BASE_PATH/ai-svc/volumes/opt/nginx-ui.conf:/opt/bitnami/nginx/conf/server_blocks/nginx.conf:z \
  $LOCAL_REGISTRY/ocpmetal/ocp-metal-ui:stable
{% endhighlight %}

At this point, if you created the GUI Bastion VM in the isolated network, you can use a web browser to navigate to the Assisted Installer Service Endpoint (https://assisted-installer.oxtechnix.lan/) to access the OAS Web UI and create clusters!
