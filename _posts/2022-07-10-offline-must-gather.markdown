---
layout: post
title:  "Offline registry for must-gather for Openshift 4!"
date:   2022-07-10 12:30:29 +0200
categories: openshift4
---
In the following post, we are going to talk about how to must-gather and ocs-must-gather into a offline Openshift 4 cluster.

Prerequisites

- Linux Operating System ( in the further steps example of this post, we are going to use Fedora Linux 36 (Workstation Edition) ).
- The host should have internet connectivity
- The host has already available the offline registry. For more details check the other post [Offline registry for Openshift 4][offline-registry]
- The host has already available the oc-client-client

Offiline mirror the must-gather and ocs-must-gather container base images

Step 1. Installing `skopeo`

{% highlight bash %}
 sudo dnf -y install skopeo
{% endhighlight %}


Step 2. Creating the `application directory` for downloading the container base images

{% highlight bash %}
 mkdir -p /apps/must-gather-images/{must-gather,ocs-must-gather}
{% endhighlight %}

Step 3. Login to the public registry

{% highlight bash %}
  skopeo login quay.io
  Username: midu16
  Password:
  Login Succeeded!
{% endhighlight %}
{% highlight bash %}
  skopeo login registry.redhat.io
  Username: midu16
  Password:
  Login Succeeded!
{% endhighlight %}

Step 4. Download the `must-gather` container base images to the local hostname

{% highlight bash %}
 export UPSTREAM_REPO_MUST_GATHER=quay.io/openshift/origin-must-gather:latest
 skopeo sync --src docker --dest dir $UPSTREAM_REPO_MUST_GATHER /apps/must-gather-images/must-gather/
 INFO[0000] Tag presence check                            imagename="quay.io/openshift/origin-must-gather:latest" tagged=true
  INFO[0000] Copying image ref 1/1                         from="docker://quay.io/openshift/origin-must-gather:latest" to="dir:/apps/must-gather-images/must-gather/origin-must-gather:latest"
  Getting image source signatures
  Copying blob f70d60810c69 done  
  Copying blob 545277d80005 done  
  Copying blob 795a19bbd9bf done  
  Copying blob bff646dd33b7 done  
  Copying blob ec088bc674ba done  
  Copying blob fea2621fdf40 done  
  Copying blob 5c609231d43d done  
  Copying config 138613a63e done  
  Writing manifest to image destination
  Storing signatures
  INFO[0034] Synced 1 images from 1 sources               
{% endhighlight %}

Step 5. Download the `ocs-must-gather` container base image to the local hostname

{% highlight bash %}
 export UPSTREAM_REPO_OCS_MUST_GATHER=registry.redhat.io/ocs4/ocs-must-gather-rhel8:latest
 skopeo sync --src docker --dest dir $UPSTREAM_REPO_OCS_MUST_GATHER /apps/must-gather-images/ocs-must-gather/
 INFO[0000] Tag presence check                            imagename="registry.redhat.io/ocs4/ocs-must-gather-rhel8:latest" tagged=true
  INFO[0000] Copying image ref 1/1                         from="docker://registry.redhat.io/ocs4/ocs-must-gather-rhel8:latest" to="dir:/apps/must-gather-images/ocs-must-gather/ocs-must-gather-rhel8:latest"
  Getting image source signatures
  Checking if image destination supports signatures
  Copying blob eac1b95df832 done  
  Copying blob 47aa3ed2034c done  
  Copying blob efc06512c6e4 done  
  Copying config b75517be43 done  
  Writing manifest to image destination
  Storing signatures
  INFO[0054] Synced 1 images from 1 sources               
{% endhighlight %}


Note that the Step 4 and Step 5 can be generalized for other container base images also. For more information on this, you can find over [Openshift gathering data about your cluster][must-gather-images].

Step 6. Upload the images downloaded to the localhost to your offline registry

- `must-gather` container base image

{% highlight bash %}
 skopeo sync --src dir --dest docker  /apps/must-gather-images/must-gather/INBACRNRDL0100.offline.oxtechnix.lan:5000 --dest-creds <username>:<password>
 INFO[0000] Copying image ref 1/1                         from="dir:/apps/must-gather-images/must-gather/origin-must-gather:latest" to="docker://INBACRNRDL0100.offline.oxtechnix.lan:5000/origin-must-gather:latest"
  Getting image source signatures
  Copying blob f70d60810c69 done  
  Copying blob 545277d80005 done  
  Copying blob 795a19bbd9bf done  
  Copying blob bff646dd33b7 done  
  Copying blob ec088bc674ba done  
  Copying blob fea2621fdf40 done  
  Copying blob 5c609231d43d done  
  Copying config 138613a63e done  
  Writing manifest to image destination
  Storing signatures
  INFO[0013] Synced 1 images from 1 sources               
{% endhighlight %}

- `ocs-must-gather` container base image

{% highlight bash %}
 skopeo sync --src dir --dest docker /apps/must-gather-images/ocs-must-gather/ INBACRNRDL0100.offline.oxtechnix.lan:5000 --dest-creds <username>:<password>
 Getting image source signatures
 Checking if image destination supports signatures
 Copying blob eac1b95df832 done  
 Copying blob 47aa3ed2034c done  
 Copying blob efc06512c6e4 done  
 Copying config b75517be43 done  
 Writing manifest to image destination
 Storing signatures
 Writing manifest to image destination
 Storing signatures
 INFO[0000] Synced 1 images from 1 sources               
{% endhighlight %}

Step 7. Verify that the images are available in the offline registry_password

{% highlight bash %}
 curl --user <username>:<password> https://INBACRNRDL0100.offline.oxtechnix.lan:5000/v2/_catalog
 {
   "repositories": [
     "ocs-must-gather-rhel8",
     "origin-must-gather"
   ]
}
{% endhighlight %}

Step 8. Further use of the `must-gather`

{% highlight bash %}
 oc adm must-gather --image-stream=openshift/must-gather --image=INBACRNRDL0100.offline.oxtechnix.lan:5000/origin-must-gather:latest
{% endhighlight %}

Step 9. Further use of the `ocs-must-gather`

{% highlight bash %}
 oc adm must-gather --image-stream=openshift/must-gather --image=INBACRNRDL0100.offline.oxtechnix.lan:5000/ocs-must-gather-rhel8:latest
{% endhighlight %}


[openshift-doc]: https://docs.openshift.com/container-platform/4.8/installing/installing-mirroring-installation-images.html
[openshift-cli-linux]:   https://access.redhat.com/downloads/content/290
[openshift-pull-secret]: https://console.redhat.com/openshift/install/pull-secret
[podman-doc]: https://podman.io/getting-started/installation
[must-gather-images]: https://docs.openshift.com/container-platform/4.7/support/gathering-cluster-data.html
[offline-registry]: https://midu16.github.io/openshift4/2022/07/09/offline-registry.html
