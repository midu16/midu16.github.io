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

```bash
mkdir -p $HOME/.config/systemd/user
podman login registry.redhat.io
podman run -d --name redhat-operator-index-4.10 -p 50051:50051 -it registry.redhat.io/redhat/redhat-operator-index:v4.10
cd $HOME/.config/systemd/user/
podman generate systemd --name  redhat-operator-index-4.10 >> container-redhat-operator-index.service
systemctl --user daemon-reload
systemctl --user enable container-redhat-operator-index.service
systemctl --user restart container-redhat-operator-index.service
```

Validate if the container its running:
```bash
podman ps
CONTAINER ID  IMAGE                                                  COMMAND               CREATED       STATUS          PORTS                     NAMES
ffe3352d17f9  registry.redhat.io/redhat/redhat-operator-index:v4.10  registry serve --...  7 weeks ago   Up 2 hours ago  0.0.0.0:50051->50051/tcp redhat-operator-index-4.10
```

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

In this section we are going to highlight an example on how to create an Offline Registry that can be used to highlight the principle of mirroring the container base images.

Creating the working directory of the Offline Registry:

{% highlight bash %}
mkdir -p ${HOME}/registry/{auth,certs,data}
{% endhighlight %}

Creating the username and password used by the Offline Registry:

{% highlight bash %}
htpasswd -bBc ${HOME}/registry/auth/htpasswd <username><password>
{% endhighlight %}

Please, note that the values for the <username> and <password> should be updated with your particular ones.

Creating the certificate used by the Offline Registry:
{% highlight bash %}
export host_fqdn=inbacrnrdl0101.offline.redhat.lan
cert_c="AT" 
cert_s="WIEN"
cert_l="WIEN"
cert_o="TelcoEngineering"
cert_ou="RedHat"
cert_cn="${host_fqdn}" 
openssl req \
    -newkey rsa:4096 \
    -nodes \
    -sha256 \
    -keyout ${HOME}/registry/certs/domain.key \
    -x509 \
    -days 365 \
    -out ${HOME}/registry/certs/domain.crt \
    -addext "subjectAltName = DNS:${host_fqdn}" \
    -subj "/C=${cert_c}/ST=${cert_s}/L=${cert_l}/O=${cert_o}/OU=${cert_ou}/CN=${cert_cn}"
{% endhighlight %}

Please, note that the values used in the certificate creation should be updated with your particular ones.
Start the Offline Registry container:

{% highlight bash %}
podman run -d --name ocpdiscon-registry -p 5050:5000 \
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
{% endhighlight %}

Based on the version list determined section **Step 1.1 How to check the operator version included in the redhat-operator-index channel** we are going to build the **imageset-config.yaml**  in order to mirror the container base images. 