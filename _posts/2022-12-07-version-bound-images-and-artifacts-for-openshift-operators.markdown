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

As described in [1], the oc-mirror cli becomes GA in channel-4.11.

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