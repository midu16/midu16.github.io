---
layout: post
title:  "Reduce overall storage required for Upgrades using oc-mirror!"
date:   2022-10-18 10:10:29 +0200
categories: openshift4
---
Having a better control of the ammount of images that the administrator of OCP is downloading in the mirroring process to the offline registry it becomes to be one of a key requirement. This control implies a better storage usage management of the offline registry. How to achieve this management we are going to discuss further.

The following list represents the prerequisites that needs to be fullfilled before proceeding with the first step:

- OCPv4.10.X
- Redhat Enterprise Linux/Rocky Linux/Fedora
- Downloaded pull-secret.txt file
- podman package available to the OS

Step 1. How to reduce the overall storage for upgrading a operator using `oc-mirror cli`:

If you dont mention the parameter `full` or `full:true` (default value) this will overwite the `minVersion` and `maxVersion` values, therefore you will download all the `odf-operator` images available in the `stable-4.10` channel:

- a example of how to perform a mirror config for the `imageset-config.yaml`:

{% highlight yaml %}
---
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
      packages:
        - name: odf-operator
          minVersion: '4.10.4'
          maxVersion: '4.10.4'
          channels:
                  - name: 'stable-4.10'
{% endhighlight %}

- a example of the channel content for the `registry.redhat.io/redhat/redhat-operator-index:v4.10`:

  - odf-operator:
{% highlight bash %}
grpcurl -plaintext  INBACRNRDL0100.offline.oxtechnix.lan:50051 api.Registry.ListBundles | jq ' .packageName, .channelName, .bundlePath, .version'
...
"odf-operator"
"stable-4.10"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:dc4d9a53dea5573e3020ad5d1ea1018705b6be25294c722d29f57bd90564c58c"
"4.10.0"
"odf-operator"
"stable-4.10"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:bc2cac50a38866218646cb8b9af10cc8fa03cb01467878ebf412e783150350ea"
"4.10.1"
"odf-operator"
"stable-4.10"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:a00e90621b5a6f94abd890c9ffa1dd9703f213b6a418b49570f692fb85affafb"
"4.10.2"
"odf-operator"
"stable-4.10"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:0651850ea45cad985998ede7e625e22ae3ffc50442142fbe49eef558cffc81a0"
"4.10.3"
"odf-operator"
"stable-4.10"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:662ec108960703f41652ff47b49e6a509a52fe244d52891d320b821dd9521f55"
"4.10.4"
"odf-operator"
"stable-4.10"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:182d966cb488b188075d2ffd3f6451eec179429ac4bff55e2e26245049953a82"
"4.10.5"
"odf-operator"
"stable-4.9"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:2231fc5ebf70c6165947bdc31f95b6deaa69f1efbd6c6194b457e2ad7bb10948"
"4.9.0"
"odf-operator"
"stable-4.9"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:e712508135eb67c2598aabc65b8bbbce9a318b1812b2a02867db2e32dbfb290a"
"4.9.1"
"odf-operator"
"stable-4.9"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:d7127d83b30998b3814f8c91759034b4f9ae527a827e0c896ef40279f5c418f9"
"4.9.10"
"odf-operator"
"stable-4.9"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:192ef97f674aaaefe4519a09b0890216e956203750d4190a6d366e8aa5f1104f"
"4.9.2"
"odf-operator"
"stable-4.9"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:e7b4f1d6c7ba12a0198f1ac36d8e6d51303021d25bfc8f289b9985e532b85a06"
"4.9.3"
"odf-operator"
"stable-4.9"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:96d4fd806017ec3df272c56af8bbccde3d300b69fee2948ec542b0a2a5b17373"
"4.9.4"
"odf-operator"
"stable-4.9"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:46437c6869986e4c394998b4db38bd19c8deee156c7ca02b33b3d336f5a08a8b"
"4.9.5"
"odf-operator"
"stable-4.9"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:eb0eb013f819ab14eb1176e6f2ce7017fc2aaa2575a95fd02cd2aa0c4701b36b"
"4.9.6"
"odf-operator"
"stable-4.9"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:b3e4af7ddab6dcd633cd0bf9fcbed57907fb4c60ef88c66e69d0fcbe86bfb9d7"
"4.9.7"
"odf-operator"
"stable-4.9"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:887b396617fe70818b9c9cf5289988801f5125cbbee2f1e3a7d95f0c3e8fa672"
"4.9.8"
"odf-operator"
"stable-4.9"
"registry.redhat.io/odf4/odf-operator-bundle@sha256:552c35a9174b0b73781c38c859cbe17086ff28a2b088fd0f15b3793bc4bb26a4"
...
{% endhighlight %}

As you an see, the above `imageset-config.yaml` file will download all the container base images in the `stable-4.10` channel of `odf-operator`, and this versions are the following:  `4.10.0, 4.10.1, 4.10.2, 4.10.3, 4.10.4, 4.10.5`. And in this way, you will required a additional disk space to host all the images.

In order to download only a specific `odf-operator` container base image you will need to use the following `imageset-config.yaml` configuration:

{% highlight yaml %}
---
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
      packages:
        - name: odf-operator
          minVersion: '4.10.4'
          maxVersion: '4.10.4'
          channels:
                  - name: 'stable-4.10'
{% endhighlight %}

As you an see, the above `imageset-config.yaml` file will download only the version `4.10.4` the container base images in the `stable-4.10` channel of `odf-operator`. And in this way, you will optimise the disk space to host all the images.

| Operator Name           | Channel Name           | Size | Container base image versions downloaded        | Size compaction |
|-------------------------|----------------------- |----- | ----------------------------------------------- |---------------- |
| odf-operator            | stable-4.10            | 25G  | 4.10.0, 4.10.1, 4.10.2, 4.10.3, 4.10.4, 4.10.5  | -               |
| odf-operator            | stable-4.10            | 6.3G | 4.10.4                                          | 75%             |
|-------------------------|----------------------- |----- | ----------------------------------------------- |---------------- |


In order to mirror from different channel versions, you will need to use the `oc-mirror` cli and define the `imageset-config.yaml` file as below:
{% highlight yaml %}
---
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
      packages:
        - name: odf-operator
          minVersion: '4.9.0'
          maxVersion: '4.10.4'
          channels:
                  - name: 'stable-4.9'
                  - name: 'stable-4.10'
{% endhighlight %}

In order to mirror specific versions, you will need to use the `oc-mirror` cli and define the `imageset-config.yaml` file as below:
{% highlight yaml %}
---
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
      packages:
        - name: odf-operator
          minVersion: '4.9.0'
          maxVersion: '4.10.4'
          channels:
                  - name: 'stable-4.9'
                  - name: 'stable-4.10'
{% endhighlight %}

In order to proceed with the mirroring process we splitted the process in two stages:

Stage number 1. Where we are downloading the specific packages locally to a tar file:
{% highlight bash %}
oc-mirror --config imageset-config.yaml file://archive
{% endhighlight %}

Stage number 2. Where we are uploading the content of the local tar file to local offline registry:
Exporting the global variables:
{% highlight bash %}
export REGISTRY_NAME=INBACRNRDL0100.offline.oxtechnix.lan
export REGISTRY_NAMESPACE=olm-mirror
{% endhighlight %}

Upload the container base images to the Offline Host registry:
{% highlight bash %}
oc-mirror --from ./archive docker://${REGISTRY_NAME}:5000/${REGISTRY_NAMESPACE}
{% endhighlight %}

Once those two stages are completed without errors, we will obtain the ICSP yaml file and we are able to verify the content of the local offline registry, to do so, use the following command:
{% highlight bash %}
curl -X GET -u <username>:<password> https://$(hostname -f):5000/v2/_catalog --insecure | jq .
{% endhighlight %}

For the first `imageset-config.yaml` the Offline Registry content its the following:
{% highlight bash %}
curl -X GET -u <username>:<password> https://$(hostname -f):5000/v2/_catalog --insecure | jq .
{
  "repositories": [
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
    "olm-mirror/openshift4/ose-csi-external-provisioner-rhel8",
    "olm-mirror/openshift4/ose-csi-external-resizer",
    "olm-mirror/openshift4/ose-csi-external-resizer-rhel8",
    "olm-mirror/openshift4/ose-csi-external-snapshotter",
    "olm-mirror/openshift4/ose-csi-external-snapshotter-rhel8",
    "olm-mirror/openshift4/ose-csi-node-driver-registrar",
    "olm-mirror/openshift4/ose-kube-rbac-proxy",
    "olm-mirror/redhat/rh-index",
    "olm-mirror/rhceph/rhceph-5-rhel8",
    "olm-mirror/rhel8/postgresql-12"
  ]
}
{% endhighlight %}

For the second `imageset-config.yaml` the Offline Registry content its the following:
{% highlight bash %}
curl -X GET -u <username>:<password> https://$(hostname -f):5000/v2/_catalog --insecure | jq .
{
  "repositories": [
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
    "olm-mirror/openshift4/ose-csi-external-provisioner-rhel8",
    "olm-mirror/openshift4/ose-csi-external-resizer",
    "olm-mirror/openshift4/ose-csi-external-resizer-rhel8",
    "olm-mirror/openshift4/ose-csi-external-snapshotter",
    "olm-mirror/openshift4/ose-csi-external-snapshotter-rhel8",
    "olm-mirror/openshift4/ose-csi-node-driver-registrar",
    "olm-mirror/openshift4/ose-kube-rbac-proxy",
    "olm-mirror/redhat/rh-index",
    "olm-mirror/rhceph/rhceph-5-rhel8",
    "olm-mirror/rhel8/postgresql-12"
  ]
}
{% endhighlight %}

Below we will compare the size of the bundle of `odf-operator`

| Operator Name           | Channel Name                  | Size | Container base image versions downloaded        | Size compaction |
|-------------------------|------------------------------ |----- | ----------------------------------------------- |---------------- |
| odf-operator            |  stable-4.9 & stable-4.10     | 68G  | 4.10.0, 4.10.1, 4.10.2, 4.10.3, 4.10.4,         | -               |
|                         |                               |      | 4.10.5                                          | -               |
|                         |                               |      | 4.9.0, 4.9.1, 4.9.2, 4.9.3, 4.9.4, 4.9.5,       |                 |
|                         |                               |      | 4.9.6, 4.9.7, 4.9.8, 4.9.9, 4.9.10              |                 |
|-------------------------|------------------------------ |----- | ----------------------------------------------- |---------------- |
| odf-operator            | stable-4.9 & stable-4.10      | 12G  | 4.9.0 & 4.10.4                                  | 82%             |
|-------------------------|------------------------------ |----- | ----------------------------------------------- |---------------- |

The content of the `imageContentSourcePolicy.yaml` :
{% highlight bash %}
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
    - inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/rhceph
    source: registry.redhat.io/rhceph
  - mirrors:
    - inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/odf4
    source: registry.redhat.io/odf4
  - mirrors:
    - inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4
    source: registry.redhat.io/openshift4
  - mirrors:
    - inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/redhat
    source: registry.redhat.io/redhat
  - mirrors:
    - inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/rhel8
    source: registry.redhat.io/rhel8
{% endhighlight %}

and the content of the `catalogSource-rh-index.yaml`:
{% highlight bash %}
---
apiVersion: operators.coreos.com/v1alpha1
kind: CatalogSource
metadata:
  name: rh-index
  namespace: openshift-marketplace
spec:
  image: inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/redhat/rh-index:v1-test
  sourceType: grpc
{% endhighlight %}

A more detail overview its available [here][offline-mirroring-tool-comparission].

[offline-mirroring-tool-comparission]: https://midu16.github.io/openshift4/2022/08/24/offline-mirroring-comparison.html


As a conclusion, we can observe that using the `full: false` parameter, the mirroring process its taking in consideration the `minVersion` and `maxVersion` parameter values and its considering only the mention container image versions. Proceeding in this way, the used storage for the mirroring its reduced considerable.
