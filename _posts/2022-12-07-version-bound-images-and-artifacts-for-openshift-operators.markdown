---
layout: post
title:  "How to version-bound images and artifacts for OpenShift operators!"
date:   2022-12-07 10:10:29 +0200
categories: openshift4
---

#### December 07, 2022 | by Mihai IDU

## Background/Purpose

A common practice in Telco environments is to rely on using an **Offline Registry** to store all the container base images for OpenShift deployments. This Offline Registry needs to meet some requirements, and in this article we will focus mainly on how to optimize the storage used by the Offline Registry. 

❗Be advised that the following values are an example representation for the purpose of this article, in your case the values might differ. 

## Environment Setup

The environment we are using consists of one bare-metal host whose role is the Bastion Node or Provisioning Node, DHCP-server and DNS-server, which will also host the Offline Registry and RHCOS-cache-httpd-server. 

The details contained in this article are independent of the installer used to deploy the cluster.

## Step 0. Installing the required tools

Download the **oc-mirror**  cli:

```bash
$ export VERSION=stable-4.11
$ curl -s https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$VERSION/oc-mirror.tar.gz | tar zxvf - oc-mirror
$ sudo cp oc-mirror /usr/local/bin
```

As described in [here][disconnected_install], the oc-mirror cli becomes GA in channel-4.11.

[disconnected_install]: https://docs.openshift.com/container-platform/4.10/installing/disconnected_install/installing-mirroring-disconnected.html

The use of the oc-mirror cli is independent of the Offline Registry used (eg. Quay, docker registry, JFROG Artifactory, etc).  

## Step 1. Building the  imageset-config.yaml 

### Step 1.1 How to check the operator version included in the redhat-operator-index channel

In this section we are going to introduce the procedure for obtaining the specific operator version we are going to use in the next section.

We are going to run the redhat-operator-index for tag 4.10 as a rootless podman:

```bash
$ mkdir -p ${HOME}/.config/systemd/user
$ podman login registry.redhat.io
$ podman run -d --name redhat-operator-index-4.10 -p 50051:50051 -it registry.redhat.io/redhat/redhat-operator-index:v4.10
$ cd ${HOME}/.config/systemd/user/
$ podman generate systemd --name  redhat-operator-index-4.10 >> container-redhat-operator-index.service
$ systemctl --user daemon-reload
$ systemctl --user enable container-redhat-operator-index.service
$ systemctl --user restart container-redhat-operator-index.service
```

Validate if the container its running:
```bash
$ podman ps
CONTAINER ID  IMAGE                                                  COMMAND               CREATED       STATUS          PORTS                     NAMES
ffe3352d17f9  registry.redhat.io/redhat/redhat-operator-index:v4.10  registry serve --...  7 weeks ago   Up 2 hours ago  0.0.0.0:50051->50051/tcp redhat-operator-index-4.10
```

By creating this container, we will be able to check the content of the channel content for OCPv4.10.

To determine the versions available we need to query the redhat-operator-index endpoint:

```bash
$ export LOCAL_RH_OPERATOR_INDEX=inbacrnrdl0101.offline.redhat.lan
$ export LOCAL_RH_OPERATOR_INDEX_PORT=50051
$ grpcurl -plaintext  ${LOCAL_RH_OPERATOR_INDEX}:${LOCAL_RH_OPERATOR_INDEX_PORT} api.Registry.ListBundles | jq ' .packageName, .channelName, .bundlePath, .version'
…
parts of the output omitted
…
"odf-operator"
"stable-4.10"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:662ec108960703f41652ff47b49e6a509a52fe244d52891d320b821dd9521f55"
"4.10.4"
"odf-operator"
"stable-4.10"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:182d966cb488b188075d2ffd3f6451eec179429ac4bff55e2e26245049953a82"
"4.10.5"
…
parts of the output omitted
…
```

The grpcurl binary has been obtained from [here][grpcurl-download]

[grpcurl-download]: https://github.com/fullstorydev/grpcurl/releases

### Step 1.2. How to build a Offline Registry [Optional]

In this section we are going to highlight an example on how to create an Offline Registry that can be used to highlight the principle of mirroring the container base images.

Creating the working directory of the Offline Registry:

```bash
$ mkdir -p ${HOME}/registry/{auth,certs,data}
```

Creating the username and password used by the Offline Registry:

```bash
$ htpasswd -bBc ${HOME}/registry/auth/htpasswd <username><password>
```

Please, note that the values for the <username> and <password> should be updated with your particular ones.

Creating the certificate used by the Offline Registry:
```bash
$ export host_fqdn=inbacrnrdl0101.offline.redhat.lan
$ cert_c="AT" 
$ cert_s="WIEN"
$ cert_l="WIEN"
$ cert_o="TelcoEngineering"
$ cert_ou="RedHat"
$ cert_cn="${host_fqdn}" 
$ openssl req \
    -newkey rsa:4096 \
    -nodes \
    -sha256 \
    -keyout ${HOME}/registry/certs/domain.key \
    -x509 \
    -days 365 \
    -out ${HOME}/registry/certs/domain.crt \
    -addext "subjectAltName = DNS:${host_fqdn}" \
    -subj "/C=${cert_c}/ST=${cert_s}/L=${cert_l}/O=${cert_o}/OU=${cert_ou}/CN=${cert_cn}"
```

Please, note that the values used in the certificate creation should be updated with your particular ones.
Start the Offline Registry container:

```bash
$ podman run -d --name ocpdiscon-registry -p 5050:5000 \
-e REGISTRY_AUTH=htpasswd \
-e REGISTRY_AUTH_HTPASSWD_REALM=Registry \
-e REGISTRY_HTTP_SECRET=ALongRandomSecretForRegistry \
-e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
-e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \
-e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \
-e REGISTRY_COMPATIBILITY_SCHEMA1_ENABLED=true \
-e REGISTRY_STORAGE_DELETE_ENABLED=true \
-v ${HOME}/registry/data:/var/lib/registry:z \
-v ${HOME}/registry/auth:/auth:z \
-v ${HOME}/registry/certs:/certs:z docker.io/library/registry:2.8.1
```

Based on the version list determined section **Step 1.1 How to check the operator version included in the redhat-operator-index channel** we are going to build the **imageset-config.yaml**  in order to mirror the container base images. 

### Step 1.3. Building the credential file for the mirroring process 

In this section we are going to build the config.json file used in the mirroring process by the oc-mirror cli to gain authorization to the registry.redhat.io and to the Offline Registry.

In the Offline Registry director create the config.json file:

```bash
$ touch ${HOME}/registry/config.json
```

Open the browser and go to the following [link][openshift-pull-secret]. As described in [here][using-image-pull-secrets], to obtain the pull-secret.json file which we are going to edit and save it under the config.json.

[openshift-pull-secret]: https://console.redhat.com/openshift/install/pull-secret

[using-image-pull-secrets]: https://docs.openshift.com/container-platform/4.10/openshift_images/managing_images/using-image-pull-secrets.html

The config.json file structure should be close to the following format:

```json
{
  "auths": {
    "cloud.openshift.com": {
      "auth": "<base64-secret>"
    },
    "inbacrnrdl0101.offline.redhat.lan:5051": {
      "auth": "<base64-secret>"
    },
    "quay.io": {
      "auth": "<base64-secret>"
    },
    "registry.connect.redhat.com": {
      "auth": "<base64-secret>"
    },
    "registry.fedoraproject.org": {
      "auth": "<base64-secret>"
    },
    "registry.redhat.io": {
      "auth": "<base64-secret>"
    }
  }
}
```
Now we will have to let oc-mirror cli use the config.json file:

```bash
$ export DOCKER_CONFIG=${HOME}/registry/config.json
```

## Step 2. How to control the storage usage of the mirror

### Step 2.1. How to mirror container base images with a compact filesystem usage

Mirror the container base images operator to the .tar file under the archive directory:

```bash
$ oc-mirror --config imageset-config.yaml file://archive
```

The content of a sample imageset-config.yaml file to be used in command above are :

```bash
$ cat imageset-config.yaml
apiVersion: mirror.openshift.io/v1alpha2
kind: ImageSetConfiguration
mirror:
  operators:
    - catalog: registry.redhat.io/redhat/redhat-operator-index:v4.10
      targetName: 'rh-index'
      targetTag: v1-test
      full: false
      packages:
        - name: odf-operator
          minVersion: '4.10.4'
          maxVersion: '4.10.4'
          channels:
                  - name: 'stable-4.10'
```

Check the archive  mirror_seq1_000000.tar size after the entire mirroring process has been finished:

```bash
$ du -h ./archive/mirror_seq1_000000.tar
6.2G    ./archive/mirror_seq1_000000.tar
```
Before proceeding with any kind of mirroring steps, we are going to have a closer look at the Offline Registry status:

```bash
$ tree ${HOME}/registry/
registry/
├── auth
│   └── htpasswd
├── certs
│   ├── domain.crt
│   └── domain.key
└── data

3 directories, 3 files
```
As we can observe, the ./data/ directory is empty at this point and we are going to proceed with the container base image mirroring procedure.

Mirror the container base images from the file mirror_seq1_000000.tar to the offline registry. 

```bash
$ export REGISTRY_NAME=inbacrnrdl0101.offline.redhat.lan
$ export REGISTRY_NAMESPACE=olm-mirror
$ export REGISTRY_PORT=5050
$ oc-mirror --from ./archive docker://${REGISTRY_NAME}:${REGISTRY_PORT}/${REGISTRY_NAMESPACE}
```
Check the content of the offline registry:

```bash
$ curl -X GET -u <username>:<password> https://${REGISTRY_NAME}:${REGISTRY_PORT}/v2/_catalog --insecure | jq .
{
  "repositories": [
    "karmab/curl",
    "karmab/kubectl",
    "karmab/mdns-publisher",
    "karmab/origin-coredns",
    "karmab/origin-keepalived-ipfailover",
    "ocp-release",
    "olm-mirror/odf4/cephcsi-rhel8",
    "olm-mirror/odf4/mcg-core-rhel8",
    "olm-mirror/odf4/mcg-operator-bundle",
    "olm-mirror/odf4/mcg-rhel8-operator",
    "olm-mirror/odf4/ocs-must-gather-rhel8",
    "olm-mirror/odf4/ocs-operator-bundle",
    "olm-mirror/odf4/ocs-rhel8-operator",
    "olm-mirror/odf4/odf-console-rhel8",
    "olm-mirror/odf4/odf-csi-addons-operator-bundle",
    "olm-mirror/odf4/odf-csi-addons-rhel8-operator",
    "olm-mirror/odf4/odf-csi-addons-sidecar-rhel8",
    "olm-mirror/odf4/odf-operator-bundle",
    "olm-mirror/odf4/odf-rhel8-operator",
    "olm-mirror/odf4/rook-ceph-rhel8-operator",
    "olm-mirror/odf4/volume-replication-rhel8-operator",
    "olm-mirror/openshift4/ose-csi-external-attacher",
    "olm-mirror/openshift4/ose-csi-external-provisioner",
    "olm-mirror/openshift4/ose-csi-external-resizer",
    "olm-mirror/openshift4/ose-csi-external-snapshotter",
    "olm-mirror/openshift4/ose-csi-node-driver-registrar",
    "olm-mirror/openshift4/ose-kube-rbac-proxy",
    "olm-mirror/redhat/rh-index",
    "olm-mirror/rhceph/rhceph-5-rhel8",
    "olm-mirror/rhel8/postgresql-12"
  ]
}
```

As it can be observed in the above output, we have a header containing base images whose purpose is to be used in the OCP deployment, those images are not usable in the odf-operator installation. This header is the following:

```bash
$ curl -X GET -u <username>:<password> https://${REGISTRY_NAME}:${REGISTRY_PORT}/v2/_catalog --insecure | jq .                                     
{
  "repositories": [
    "karmab/curl",
    "karmab/kubectl",
    "karmab/mdns-publisher",
    "karmab/origin-coredns",
    "karmab/origin-keepalived-ipfailover",
    "ocp-release"
  ]
}
```

This header’s filesystem usage:
```bash
$ du -h ${HOME}/registry/data/ --max-depth=1
13G     registry/data/docker
13G     registry/data/
```

Highlighted the content of the **odf-operator** mirrored. Now we are going to evaluate the file system used at this moment by the above content of the offline registry.
```bash
$ du -h ${HOME}/registry/data/ --max-depth=1
19G     registry/data/docker
19G     registry/data/
```

### Step 2.2. How to make use of the Offline Registry content to your OCP cluster

Once the mirroring of the operators is finished the process is creating the following directory: oc-mirror-workspace/results-1667747309 for which we will use the following two files to apply it to the OCP cluster:
```bash
$ cat oc-mirror-workspace/results-1667747309/catalogSource-rh-index.yaml
apiVersion: operators.coreos.com/v1alpha1
kind: CatalogSource
metadata:
  name: rh-index
  namespace: openshift-marketplace
spec:
  image: inbacrnrdl0101.offline.redhat.lan:5050/olm-mirror/redhat/rh-index:v1-test
  sourceType: grpc
```

```bash
$ cat oc-mirror-workspace/results-1667747309/imageContentSourcePolicy.yaml
---
apiVersion: operator.openshift.io/v1alpha1
kind: ImageContentSourcePolicy
metadata:
  labels:
    operators.openshift.org/catalog: "true"
  name: operator-0
spec:
  repositoryDigestMirrors:
  - mirrors:
    - inbacrnrdl0101.offline.redhat.lan:5050/olm-mirror/openshift4
    source: registry.redhat.io/openshift4
  - mirrors:
    - inbacrnrdl0101.offline.redhat.lan:5050/olm-mirror/odf4
    source: registry.redhat.io/odf4
  - mirrors:
    - inbacrnrdl0101.offline.redhat.lan:5050/olm-mirror/rhel8
    source: registry.redhat.io/rhel8
  - mirrors:
    - inbacrnrdl0101.offline.redhat.lan:5050/olm-mirror/rhceph
    source: registry.redhat.io/rhceph
  - mirrors:
    - inbacrnrdl0101.offline.redhat.lan:5050/olm-mirror/redhat
    source: registry.redhat.io/redhat
```

![CatalogSources](/assets/images/RHblog/pic1.png)

Looking at the applied catalog source, we can observe that the endpoint corresponds to the offline registry used: inbacrnrdl0101.offline.redhat.lan:5050. 

![CatalogSourcesDetails](/assets/images/RHblog/pic2.png)

In order to validate that there are no dependencies missing for the odf-mirror we will proceed installing the operator on the OCP cluster.

- Start the installation of **odf-operator**:

![InstallingODFOperator](/assets/images/RHblog/pic4.png)

- **odf-operator** is installed:

![InstalledODFOperator](/assets/images/RHblog/pic5.png)

- The installed **odf-operator** subscription used:

![InstalledODFOperator](/assets/images/RHblog/pic6.png)

- **odf-operator** pods status:

```bash
$ oc get pods -n openshift-storage
NAME                                               READY   STATUS    RESTARTS      AGE
csi-addons-controller-manager-78c75c4c7-wq4p5      2/2     Running   2 (37m ago)   77m
noobaa-operator-6fdd894554-ptnm9                   1/1     Running   0             78m
ocs-metrics-exporter-775b6d4bdf-k5d52              1/1     Running   0             78m
ocs-operator-6bf7b6dfc6-zwwzv                      1/1     Running   2 (37m ago)   78m
odf-console-6dff658495-dcfxh                       1/1     Running   0             78m
odf-operator-controller-manager-54ddd5db9c-mpkwt   2/2     Running   2 (37m ago)   78m
rook-ceph-operator-57bfbcc9d-hb9tk                 1/1     Running   0             78m
```

### Step 2.3. How to mirror container base images with a uncompact filesystem usage

Now we evaluate the filesystem usage when the imageset-config.yaml parameter full: true is used, the imageset-config.yaml file will have the following content:

```bash
$ cat imageset-config.yaml
apiVersion: mirror.openshift.io/v1alpha2
kind: ImageSetConfiguration
mirror:
  operators:
    - catalog: registry.redhat.io/redhat/redhat-operator-index:v4.10
      targetName: 'rh-index'
      targetTag: v1-test
      full: true
      packages:
        - name: odf-operator
          minVersion: '4.10.4'
          maxVersion: '4.10.4'
          channels:
                  - name: 'stable-4.10'
```

Proceed to mirror the **odf-operator** container base images to the .tar file as highlighted above:
```bash
$ oc-mirror --config imageset-config.yaml file://archive
```

Once the mirroring has completed, validate the .tar file size in comparison with the previous check:

```bash
$ du -h ./archive/mirror_seq1_000000.tar
32G     ./archive/mirror_seq1_000000.tar
```

- Filesystem usage of the .tar file comparison:

| imageset-config.yaml differences      | mirror_seq1_000000.tar [Gb] | Notes             |
| ------------------------------------- | --------------------------- | ----------------- |
| with full: true                       | 32                          |                   |
| with full: false                      | 6.2                         | 80.625% decrease  |

We can observe from the .tar file size that its size was reduced by 80% for the same content as in the previous,  **Step 2.1. How to mirror container base images with a compact filesystem usage example**.

Mirror the container base images from the newly created file mirror_seq1_000000.tar to the offline registry. Be advised that the following values are an example representation for the purpose of this article, in your case the values might differ.

```bash
$ export REGISTRY_NAME=inbacrnrdl0101.offline.redhat.lan
$ export REGISTRY_NAMESPACE=olm-mirror
$ export REGISTRY_PORT=5050
$ oc-mirror --from ./archive docker://${REGISTRY_NAME}:${REGISTRY_PORT}/${REGISTRY_NAMESPACE}
```
Check the content of the offline registry:

```bash
$ curl -X GET -u <username>:<password> https://${REGISTRY_NAME}:${REGISTRY_PORT}/v2/_catalog --insecure | jq .
{
  "repositories": [
    "karmab/curl",
    "karmab/kubectl",
    "karmab/mdns-publisher",
    "karmab/origin-coredns",
    "karmab/origin-keepalived-ipfailover",
    "ocp-release",
    "olm-mirror/odf4/cephcsi-rhel8",
    "olm-mirror/odf4/mcg-core-rhel8",
    "olm-mirror/odf4/mcg-operator-bundle",
    "olm-mirror/odf4/mcg-rhel8-operator",
    "olm-mirror/odf4/ocs-must-gather-rhel8",
    "olm-mirror/odf4/ocs-operator-bundle",
    "olm-mirror/odf4/ocs-rhel8-operator",
    "olm-mirror/odf4/odf-console-rhel8",
    "olm-mirror/odf4/odf-csi-addons-operator-bundle",
    "olm-mirror/odf4/odf-csi-addons-rhel8-operator",
    "olm-mirror/odf4/odf-csi-addons-sidecar-rhel8",
    "olm-mirror/odf4/odf-operator-bundle",
    "olm-mirror/odf4/odf-rhel8-operator",
    "olm-mirror/odf4/rook-ceph-rhel8-operator",
    "olm-mirror/odf4/volume-replication-rhel8-operator",
    "olm-mirror/openshift4/ose-csi-external-attacher",
    "olm-mirror/openshift4/ose-csi-external-provisioner",
    "olm-mirror/openshift4/ose-csi-external-resizer",
    "olm-mirror/openshift4/ose-csi-external-snapshotter",
    "olm-mirror/openshift4/ose-csi-node-driver-registrar",
    "olm-mirror/openshift4/ose-kube-rbac-proxy",
    "olm-mirror/redhat/rh-index",
    "olm-mirror/rhceph/rhceph-5-rhel8",
    "olm-mirror/rhel8/postgresql-12"
  ]
}
```
We can observe that the content of the offline registry is identical.

Validate the file system used by the container base images mirrored to the offline registry:

```bash
$ du -h ${HOME}/registry/data/ --max-depth=1
44G     registry/data/docker
44G     registry/data/
```
- Filesystem usage of the uncompressed container base images usage comparison: 

| imageset-config.yaml differences      | mirror_seq1_000000.tar [Gb] | Notes             |
| ------------------------------------- | --------------------------- | ----------------- |
| with full: true                       | 44                          |                   |
| with full: false                      | 19                          | 56.8182% decrease |

We can observe from the offline registry container base image content size was optimized with 56.8182% for the same content in the previous example.

## Conclusions

In conclusion, by leveraging the version control and restricting the container base image download we are able to optimize the filesystem usage of the offline registry.
