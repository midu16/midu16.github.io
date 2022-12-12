---
layout: post
title:  "How to version-bound images and artifacts for OpenShift operators!"
date:   2022-12-07 10:10:29 +0200
categories: openshift4
---


## Background/Purpose

A common practice in Telco environments is to rely on using an **Offline Registry** to store all the container base images for OpenShift deployments. This Offline Registry needs to meet some requirements, and in this article we will focus mainly on how to optimize the storage used by the Offline Registry. 

❗Be advised that the following values are an example representation for the purpose of this article, in your case the values might differ. 

## Environment Setup

The environment we are using consists of one bare-metal host whose role is the Bastion Node or Provisioning Node, DHCP-server and DNS-server, which will also host the Offline Registry and RHCOS-cache-httpd-server. 

The details contained in this article are independent of the installer used to deploy the cluster.

## Step 0. Installing the required tools

Download the **oc-mirror**  cli:

{% highlight bash %}
export VERSION=stable-4.11
curl -s https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$VERSION/oc-mirror.tar.gz | tar zxvf - oc-mirror
sudo cp oc-mirror /usr/local/bin
{% endhighlight %}

As described in [here][disconnected_install], the oc-mirror cli becomes GA in channel-4.11.
[disconnected_install]: https://docs.openshift.com/container-platform/4.10/installing/disconnected_install/installing-mirroring-disconnected.html

The use of the oc-mirror cli is independent of the Offline Registry used (eg. Quay, docker registry, JFROG Artifactory, etc).  

## Step 1. Building the  imageset-config.yaml 

### Step 1.1 How to check the operator version included in the redhat-operator-index channel

In this section we are going to introduce the procedure for obtaining the specific operator version we are going to use in the next section.

We are going to run the redhat-operator-index for tag 4.10 as a rootless podman:

{% highlight bash %}
mkdir -p ${HOME}/.config/systemd/user
podman login registry.redhat.io
podman run -d --name redhat-operator-index-4.10 -p 50051:50051 -it registry.redhat.io/redhat/redhat-operator-index:v4.10
cd ${HOME}/.config/systemd/user/
podman generate systemd --name  redhat-operator-index-4.10 >> container-redhat-operator-index.service
systemctl --user daemon-reload
systemctl --user enable container-redhat-operator-index.service
systemctl --user restart container-redhat-operator-index.service
{% endhighlight %}

Validate if the container its running:
podman ps
CONTAINER ID  IMAGE                                                  COMMAND               CREATED       STATUS          PORTS                     NAMES
ffe3352d17f9  registry.redhat.io/redhat/redhat-operator-index:v4.10  registry serve --...  7 weeks ago   Up 2 hours ago  0.0.0.0:50051->50051/tcp redhat-operator-index-4.10
{% endhighlight %}

By creating this container, we will be able to check the content of the channel content for OCPv4.10.

To determine the versions available we need to query the redhat-operator-index endpoint:

{% highlight bash %}
export LOCAL_RH_OPERATOR_INDEX=inbacrnrdl0101.offline.redhat.lan
export LOCAL_RH_OPERATOR_INDEX_PORT=50051
grpcurl -plaintext  ${LOCAL_RH_OPERATOR_INDEX}:${LOCAL_RH_OPERATOR_INDEX_PORT} api.Registry.ListBundles | jq ' .packageName, .channelName, .bundlePath, .version'
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
{% endhighlight %}

The grpcurl binary has been obtained from [here][grpcurl-download]
[grpcurl-download]: https://github.com/fullstorydev/grpcurl/releases

### Step 1.2. How to build a Offline Registry [Optional]