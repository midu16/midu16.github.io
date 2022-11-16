---
layout: post
title:  "Creating an RHCOS images cache for Openshift 4!"
date:   2022-07-11 12:32:29 +0200
categories: openshift4
---
In the following post, we are going to talk about how to locally cash the RHCOS images for Openshift 4.

Prerequisites

- Linux Operating System ( in the further steps example of this post, we are going to use Fedora Linux 36 (Workstation Edition) ).
- The host should have internet connectivity
- `openshift-baremetal-install-cli`:

{% highlight bash %}
 export VERSION=stable-4.8
 export RELEASE_IMAGE=$(curl -s https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$VERSION/release.txt | grep 'Pull From: quay.io' | awk -F ' ' '{print $3}')
 export cmd=openshift-baremetal-install
 export pullsecret_file=${HOME}/pull-secret.json
 export extract_dir=$(pwd)
 curl -s https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$VERSION/openshift-client-linux.tar.gz | tar zxvf - oc
 sudo cp oc /usr/local/bin
 oc adm release extract --registry-config "${pullsecret_file}" --command=$cmd --to "${extract_dir}" ${RELEASE_IMAGE}
 sudo cp openshift-baremetal-install /usr/local/bin
 openshift-baremetal-install version
openshift-baremetal-install 4.8.45
built from commit b67c48b3ba135f2a02b791b6bc42ca6cf0780c88
release image quay.io/openshift-release-dev/ocp-release@sha256:e9bcc5d74c4d6651f15601392e7eec52a9feacbf583ca5323ddeb9d3a878d75d
{% endhighlight %}


RHCOS cache images

Step 1. Install podman

{% highlight bash %}
 sudo dnf install -y podman
{% endhighlight %}

Step 2. Open firewall

{% highlight bash %}
 sudo firewall-cmd --add-port=3000/tcp --zone=public --permanent
 sudo firewall-cmd --reload
{% endhighlight %}

Step 3. Creating the RHCOS cache images directory

{% highlight bash %}
 mkdir -p /apps/rhcos_image_cache
{% endhighlight %}

{% highlight bash %}
 sudo semanage fcontext -a -t httpd_sys_content_t "/apps/rhcos_image_cache(/.*)?"
 sudo restorecon -Rv /apps/rhcos_image_cache/
 Relabeled /apps/rhcos_image_cache from unconfined_u:object_r:unlabeled_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0
{% endhighlight %}

Step 4. Get the URI for the RHCOS image that the installation program will deploy on the bootstrap VM

{% highlight bash %}
 export RHCOS_QEMU_URI=$(/usr/local/bin/openshift-baremetal-install coreos print-stream-json | jq -r --arg ARCH "$(arch)" '.architectures[$ARCH].artifacts.qemu.formats["qcow2.gz"].disk.location')
{% endhighlight %}

Step 5. Get the name of the image that the installation program will deploy on the bootstrap VM

{% highlight bash %}
 export export RHCOS_QEMU_NAME=${RHCOS_QEMU_URI##*/}
 export RHCOS_QEMU_UNCOMPRESSED_SHA256=$(/usr/local/bin/openshift-baremetal-install coreos print-stream-json | jq -r --arg ARCH "$(arch)" '.architectures[$ARCH].artifacts.qemu.formats["qcow2.gz"].disk["uncompressed-sha256"]')
 export RHCOS_OPENSTACK_URI=$(/usr/local/bin/openshift-baremetal-install coreos print-stream-json | jq -r --arg ARCH "$(arch)" '.architectures[$ARCH].artifacts.openstack.formats["qcow2.gz"].disk.location')
 export RHCOS_OPENSTACK_NAME=${RHCOS_OPENSTACK_URI##*/}
 export RHCOS_OPENSTACK_UNCOMPRESSED_SHA256=$(/usr/local/bin/openshift-baremetal-install coreos print-stream-json | jq -r --arg ARCH "$(arch)" '.architectures[$ARCH].artifacts.openstack.formats["qcow2.gz"].disk["uncompressed-sha256"]')
 curl -L ${RHCOS_QEMU_URI} -o /apps/rhcos_image_cache/${RHCOS_QEMU_NAME}
 curl -L ${RHCOS_OPENSTACK_URI} -o /apps/rhcos_image_cache/${RHCOS_OPENSTACK_NAME}
 ls -Z /apps/rhcos_image_cache
{% endhighlight %}

Step 6. Create the pod:

{% highlight bash %}
 podman run -d --name rhcos_image_cache -v /apps/rhcos_image_cache:/var/www/html -p 3000:8080/tcp quay.io/centos7/httpd-24-centos7:latest
{% endhighlight %}

Step 7. Systemd manage of `rhcos_image_cache`

{% highlight bash %}
 mkdir -p ${HOME}/.config/systemd/user/
 cd ${HOME}/.config/systemd/user/
 podman generate systemd --new --files --name rhcos_image_cache
 systemctl --user daemon-reload
 systemctl --user start container-rhcos_image_cache.service
 systemctl --user enable container-rhcos_image_cache.service
 systemctl --user is-active container-rhcos_image_cache.service
 cd ${HOME}
{% endhighlight %}

The above command creates a caching webserver with the name rhcos_image_cache, which serves the images for deployment. The first image ${RHCOS_PATH}${RHCOS_QEMU_URI}?sha256=${RHCOS_QEMU_SHA_UNCOMPRESSED} is the bootstrapOSImage and the second image ${RHCOS_PATH}${RHCOS_OPENSTACK_URI}?sha256=${RHCOS_OPENSTACK_SHA_COMPRESSED} is the clusterOSImage in the install-config.yaml file.

Step 8. Generate the bootstrapOSImage and clusterOSImage configuration

This step will be detail on the next post, for which we will overview the creation of `install-config.yaml` file.
For more details you can check the official [Openshift Documentation][openshift-doc]

[openshift-doc]: https://docs.openshift.com/container-platform/4.9/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html
[openshift-cli-linux]:   https://access.redhat.com/downloads/content/290
[openshift-pull-secret]: https://console.redhat.com/openshift/install/pull-secret
[podman-doc]: https://podman.io/getting-started/installation
[offline-registry]: https://midu16.github.io/openshift4/2022/07/09/offline-registry.html
