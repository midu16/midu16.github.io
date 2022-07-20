---
layout: post
title:  "Offline mirror for Openshift 4!"
date:   2022-07-10 12:32:29 +0200
categories: openshift4
---
In the following post, we are going to talk about how to mirror specific operators for Openshift 4.

Prerequisites

- Linux Operating System ( in the further steps example of this post, we are going to use Fedora Linux 36 (Workstation Edition) ).
- The host should have internet connectivity
- The host has already available the offline registry. For more details check the other post [Offline registry for Openshift 4][offline-registry]
- The host has already available the oc-client-client


Offiline mirroring

Step 1. Make sure you have the right `pull-secret.json` file

Go to the [Download Openshift pull-secret][openshift-pull-secret] to download the pull-secret file. Once you obtain the file check the following command to  

Step 2. Modifying `pull-secret` file for offline-registry use

{% highlight bash %}
 cat ${HOME}/Downloads/pull-secret | jq . > /apps/registry/pull-secret.json
{% endhighlight %}

The following `/apps/registry/pull-secret.json` content would follow the following template:
{% highlight json %}
{
  "auths": {
    "cloud.openshift.com": {
      "auth": "b3BlbnNo...",
      "email": "you@example.com"
    },
    "quay.io": {
      "auth": "b3BlbnNo...",
      "email": "you@example.com"
    },
    "registry.connect.redhat.com": {
      "auth": "NTE3Njg5Nj...",
      "email": "you@example.com"
    },
    "registry.redhat.io": {
      "auth": "NTE3Njg5Nj...",
      "email": "you@example.com"
    }
  }
}
{% endhighlight %}
Now we should add the section that describes the credentials to the offline registry:
{% highlight json %}
"auths": {
    "<mirror_registry>": {
      "auth": "<credentials>",
      "email": "you@example.com"
  },
{% endhighlight %}
In the end the `pull-secret.json` should follow the following template:
{% highlight json %}
{
  "auths": {
    "cloud.openshift.com": {
      "auth": "b3BlbnNo...",
      "email": "you@example.com"
    },
    "quay.io": {
      "auth": "b3BlbnNo...",
      "email": "you@example.com"
    },
    "registry.connect.redhat.com": {
      "auth": "NTE3Njg5Nj...",
      "email": "you@example.com"
    },
    "registry.redhat.io": {
      "auth": "NTE3Njg5Nj...",
      "email": "you@example.com"
    },
    "<mirror_registry>": {
      "auth": "<credentials>",
      "email": "you@example.com"
    }
  }
}

{% endhighlight %}

Step 3. Login to the offline registry

{% highlight bash %}
 podman login --authfile pull-secret.json -u <username> -p <password> INBACRNRDL0100.offline.oxtechnix.lan:5000
 Login Succeeded!
{% endhighlight %}

Step 4. Login to the `registry.redhat.io`

{% highlight bash %}

{% endhighlight %}



[openshift-doc]: https://docs.openshift.com/container-platform/4.8/installing/installing-mirroring-installation-images.html
[openshift-cli-linux]:   https://access.redhat.com/downloads/content/290
[openshift-pull-secret]: https://console.redhat.com/openshift/install/pull-secret
[podman-doc]: https://podman.io/getting-started/installation
[offline-registry]: https://midu16.github.io/openshift4/2022/07/09/offline-registry.html
