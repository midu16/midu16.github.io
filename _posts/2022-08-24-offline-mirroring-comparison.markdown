---
layout: post
title:  "Offline mirroring tool comparison for Openshift 4!"
date:   2022-08-24 10:10:29 +0200
categories: openshift4
---
In the following post, we are going to talk on how to mirror the container base images locally first to an .tar file and later upload them to the offline registry on the Bastion Host.

Prerequisites

- OCPv4.10.X
- Redhat Enterprise Linux/Rocky Linux/Fedora 
- Downloaded pull-secret.txt file
- podman package available to the OS

Step 1. Downloading oc-cli and oc-mirror-cli to the Bastion Host:

- Download oc-cli:
{% highlight bash %}
export VERSION=stable-4.10
curl -s https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$VERSION/openshift-client-linux.tar.gz | tar zxvf - oc
sudo cp oc /usr/local/bin
{% endhighlight %}

- Download oc-mirror-cli:
{% highlight bash %}
export VERSION=stable-4.10
curl -s https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$VERSION/oc-mirror.tar.gz | tar zxvf - oc-mirror
sudo cp oc-mirror /usr/local/bin
{% endhighlight %}

Step 2. Creating the redhat-operator-index container 

{% highlight bash %}
podman run -d --name redhat-operator-index-4.10 -p 5051:5051 -it registry.redhat.io/redhat/redhat-operator-index:v4.10
cd ${HOME}/.config/user/systemd/user/
podman generate systemd --name redhat-operator-index-4.10 >> container-redhat-operator-index.service
systemctl --user daemon-reload
systemctl --user enable container-redhat-operator-index.service
systemctl --user restart container-redhat-operator-index.service
{% endhighlight %}

By creating the redhat-operator-index container we can query the available operator versions to download on the channel: stable-4.10.

Step 3. Usage of the redhat-operator-index container api

- List a specific operator by filtering on the name:

{% highlight bash %}
grpcurl -plaintext -d '{"name":"local-storage-operator"}' INBACRNRDL0100.offline.oxtechnix.lan:50051 api.Registry/GetPackage
{
  "name": "local-storage-operator",
  "channels": [
    {
      "name": "4.10",
      "csvName": "local-storage-operator.4.10.0-202208150436"
    },
    {
      "name": "stable",
      "csvName": "local-storage-operator.4.10.0-202208150436"
    }
  ],
  "defaultChannelName": "stable"
}
{% endhighlight %}

- The full list of operators supported by the redhat-operator-index:
{% highlight bash %}
grpcurl -plaintext INBACRNRDL0100.offline.oxtechnix.lan:50051 api.Registry/ListPackages
{
  "name": "3scale-operator"
}
{
  "name": "advanced-cluster-management"
}
{
  "name": "amq-broker-rhel8"
}
{
  "name": "amq-online"
}
{
  "name": "amq-streams"
}
{
  "name": "amq7-interconnect-operator"
}
{
  "name": "ansible-automation-platform-operator"
}
{
  "name": "ansible-cloud-addons-operator"
}
{
  "name": "apicast-operator"
}
{
  "name": "aws-efs-csi-driver-operator"
}
{
  "name": "aws-load-balancer-operator"
}
{
  "name": "bamoe-businessautomation-operator"
}
{
  "name": "bamoe-kogito-operator"
}
{
  "name": "bare-metal-event-relay"
}
{
  "name": "businessautomation-operator"
}
{
  "name": "cincinnati-operator"
}
{
  "name": "cluster-kube-descheduler-operator"
}
{
  "name": "cluster-logging"
}
{
  "name": "clusterresourceoverride"
}
{
  "name": "codeready-workspaces"
}
{
  "name": "codeready-workspaces2"
}
{
  "name": "compliance-operator"
}
{
  "name": "container-security-operator"
}
{
  "name": "costmanagement-metrics-operator"
}
{
  "name": "cryostat-operator"
}
{
  "name": "datagrid"
}
{
  "name": "devspaces"
}
{
  "name": "devworkspace-operator"
}
{
  "name": "dpu-network-operator"
}
{
  "name": "eap"
}
{
  "name": "elasticsearch-operator"
}
{
  "name": "external-dns-operator"
}
{
  "name": "file-integrity-operator"
}
{
  "name": "fuse-apicurito"
}
{
  "name": "fuse-console"
}
{
  "name": "fuse-online"
}
{
  "name": "gatekeeper-operator-product"
}
{
  "name": "idp-mgmt-operator-product"
}
{
  "name": "integration-operator"
}
{
  "name": "jaeger-product"
}
{
  "name": "jws-operator"
}
{
  "name": "kiali-ossm"
}
{
  "name": "klusterlet-product"
}
{
  "name": "kubernetes-nmstate-operator"
}
{
  "name": "kubevirt-hyperconverged"
}
{
  "name": "local-storage-operator"
}
{
  "name": "loki-operator"
}
{
  "name": "mcg-operator"
}
{
  "name": "metallb-operator"
}
{
  "name": "mtc-operator"
}
{
  "name": "mtv-operator"
}
{
  "name": "multicluster-engine"
}
{
  "name": "nfd"
}
{
  "name": "node-healthcheck-operator"
}
{
  "name": "node-maintenance-operator"
}
{
  "name": "numaresources-operator"
}
{
  "name": "ocs-operator"
}
{
  "name": "odf-csi-addons-operator"
}
{
  "name": "odf-lvm-operator"
}
{
  "name": "odf-multicluster-orchestrator"
}
{
  "name": "odf-operator"
}
{
  "name": "odr-cluster-operator"
}
{
  "name": "odr-hub-operator"
}
{
  "name": "openshift-cert-manager-operator"
}
{
  "name": "openshift-custom-metrics-autoscaler-operator"
}
{
  "name": "openshift-gitops-operator"
}
{
  "name": "openshift-pipelines-operator-rh"
}
{
  "name": "openshift-secondary-scheduler-operator"
}
{
  "name": "openshift-special-resource-operator"
}
{
  "name": "opentelemetry-product"
}
{
  "name": "performance-addon-operator"
}
{
  "name": "poison-pill-manager"
}
{
  "name": "ptp-operator"
}
{
  "name": "quay-bridge-operator"
}
{
  "name": "quay-operator"
}
{
  "name": "red-hat-camel-k"
}
{
  "name": "redhat-oadp-operator"
}
{
  "name": "rh-service-binding-operator"
}
{
  "name": "rhacs-operator"
}
{
  "name": "rhpam-kogito-operator"
}
{
  "name": "rhsso-operator"
}
{
  "name": "sandboxed-containers-operator"
}
{
  "name": "serverless-operator"
}
{
  "name": "service-registry-operator"
}
{
  "name": "servicemeshoperator"
}
{
  "name": "skupper-operator"
}
{
  "name": "sriov-network-operator"
}
{
  "name": "submariner"
}
{
  "name": "tang-operator"
}
{
  "name": "topology-aware-lifecycle-manager"
}
{
  "name": "vertical-pod-autoscaler"
}
{
  "name": "volsync-product"
}
{
  "name": "web-terminal"
}
{
  "name": "windows-machine-config-operator"
}
{% endhighlight %}

Step 4 Mirroring a specific list of container based images operator:

For the future comparission between the tools, we are going to consider the following list of operators:
	- local-storage-operator
	- odf-operator
	- mcg-operator
	- metallb-operator
	- kubernetes-nmstate-operator

- oc-cli mirroring process:

Make sure you are checking the following [What to configure for pull-secret file][offline-mirroring]

[offline-mirroring]: https://midu16.github.io/openshift4/2022/07/10/offline-mirroring.html

We are going to split the action of mirroring in two parts:
 - Connected Host, where the host can reach the internet 
 - Offline Host, where the host doesnt reach the internet BUT has a connection to an SFTP server.

- Connected Host actions:

{% highlight bash %}
export VERSION=stable-4.10
curl -s https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/${VERSION}/opm-linux.tar.gz  | tar zxvf - opm-linux
sudo cp opm-linux /usr/local/bin
opm version
	Version: version.Version{OpmVersion:"69bb8fe0a", GitCommit:"69bb8fe0ac3a93472b5aace0df7722c4eaf23b92",BuildDate:"2022-07-29T20:18:10Z", GoOs:"linux", GoArch:"amd64"}
{% endhighlight %}

Once opm-cli is made available to the host, you can proceed with creating the [Offline registrz on the Connected Host][offline-registry]

[offline-registry]: https://midu16.github.io/openshift4/2022/07/09/offline-registry.html

{% highlight bash %}
export REGISTRY_NAME=INBACRNRDL0100.offline.oxtechnix.lan
export PULL_SECRET_FILE=./pull-secret.json
export REG_USER_PASSWD=$(cat ${PULL_SECRET_FILE} |jq .auths.\"${REGISTRY_NAME}:5000\".auth -r|base64 -d)
export REG_USER=$(echo ${REG_USER_PASSWD}|cut -d ":" -f 1)
export REG_PASSWORD=$(echo ${REG_USER_PASSWD}|cut -d ":" -f 2)
export RH_USER_PASSWD=$(cat ${PULL_SECRET_FILE}|jq .auths.\"registry.redhat.io\".auth -r|base64 -d)
export OLM_PKGS="local-storage-operator,odf-operator,mcg-operator,metallb-operator,kubernetes-nmstate-operator"
export OCP_VERSION=v4.10
export REGISTRY_NAMESPACE=olm-mirror
{% endhighlight %}

Start the container base image prune

{% highlight bash %}
opm index prune -f registry.redhat.io/redhat/redhat-operator-index:${OCP_VERSION} -p ${OLM_PKGS} -t ${REGISTRY_NAME}:5000/${REGISTRY_NAMESPACE}/redhat-operator-index:${OCP_VERSION}
{% endhighlight %}

Pushing the pruned container based images to the local registry:

{% highlight bash %}
podman push ${REGISTRY_NAME}:5000/${REGISTRY_NAMESPACE}/redhat-operator-index:${OCP_VERSION} 
{% endhighlight %}

Downloading the container base images from the local registry localy:

{% highlight bash %}
oc adm catalog mirror ${REGISTRY_NAME}:5000/${REGISTRY_NAMESPACE}/redhat-operator-index:${OCP_VERSION} file://local/index -a ${PULL_SECRET_FILE} --insecure

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!! DEPRECATION NOTICE:
!!   Sqlite-based catalogs are deprecated. Support for them will be removed in a
!!   future release. Please migrate your catalog workflows to the new file-based
!!   catalog format.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

src image has index label for database path: /database/index.db
using index path mapping: /database/index.db:/tmp/953794212
wrote database to /tmp/953794212
using database at: /tmp/953794212/index.db
...

{% endhighlight %}

Creating the archive of the container based images already downloaded localy:

{% highlight bash %}
tar czf ${REGISTRY_NAME}.tar.gz v2/
{% endhighlight %}

At this state you need to move the .tar.gz file to the Offline Host.

- Offline Host actions:

