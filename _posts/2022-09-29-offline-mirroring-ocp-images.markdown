---
layout: post
title:  "Mirror OCP container base images for Openshift 4!"
date:   2022-09-29 10:10:29 +0200
categories: openshift4
---
In the following post, we are going to talk on how to mirror the ocp container base images locally first to an .tar file and later upload them to the offline registry on the Bastion Host.

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

Note:  The `oc-mirror` its Technical Preview on `stable-4.10` channel and on `stable-4.11` channel its General Available.

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

To download the `grpcurl`, you will need to download the binary from [grpcurl binary release][grpcurl-release].

[grpcurl-release]: https://github.com/fullstorydev/grpcurl/releases

Documenting the offline registry api:
{% highlight bash %}
grpcurl -plaintext INBACRNRDL0100.offline.oxtechnix.lan:50051 list api.Registry
api.Registry.GetBundle
api.Registry.GetBundleForChannel
api.Registry.GetBundleThatReplaces
api.Registry.GetChannelEntriesThatProvide
api.Registry.GetChannelEntriesThatReplace
api.Registry.GetDefaultBundleThatProvides
api.Registry.GetLatestChannelEntriesThatProvide
api.Registry.GetPackage
api.Registry.ListBundles
api.Registry.ListPackages
{% endhighlight %}

In order to dig more information about an specific api:
{% highlight bash %}
grpcurl -plaintext INBACRNRDL0100.offline.oxtechnix.lan:50051 describe api.Registry.GetBundleForChannel
api.Registry.GetBundleForChannel is a method:
rpc GetBundleForChannel ( .api.GetBundleInChannelRequest ) returns ( .api.Bundle );
{% endhighlight %}


Step 4. Comparing the mirroring

- `oc adm mirror`:
Exporting the global variables:
{% highlight bash %}
export OCP_VERSION="4.10.26"
export UPSTREAM_REPO=$(curl -s https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$OCP_VERSION/release.txt | grep 'Pull From: quay.io' | awk -F ' ' '{print $3}')
echo $UPSTREAM_REPO
quay.io/openshift-release-dev/ocp-release@sha256:e1fa1f513068082d97d78be643c369398b0e6820afab708d26acda2262940954
export LOCAL_REG="INBACRNRDL0100.offline.oxtechnix.lan:5000"
export LOCAL_REPO="ocp-release"
export VERSION="${OCP_VERSION}-x86_64"
export PULLSECRET_FILE=/apps/offline-registry/pull-secret.json
export LOCAL_MEDIA_PATH=/apps/offline-registry/working-dor
{% endhighlight %}

Mirroring the images to the local file:
{% highlight bash %}
oc adm release mirror -a ${PULLSECRET_FILE} --from=$UPSTREAM_REPO --to-dir=${LOCAL_MEDIA_PATH}/mirror --apply-release-image-signature --insecure=true
{% endhighlight %}

Uploading the images to the offline registry:
{% highlight bash %}
oc image mirror -a ${PULLSECRET_FILE} --from-dir=${LOCAL_MEDIA_PATH}/mirror "file://openshift/release:${VERSION}*" ${LOCAL_REG}/${LOCAL_REPO}
{% endhighlight %}

Storage container based images summary:

| Container Base Name     | Size  |
|-------------------------|------ |
| ocp-release:4.10.26     |  12G  |
|-------------------------|-------|
