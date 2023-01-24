---
layout: post
title:  "How to apply kernel drivers onto OCP v4.12.0"
date:   2023-01-24 10:10:29 +0200
categories: openshift4
---

#### February 1, 2023 | by Mihai IDU

## Background/Purpose

In the world of new Telco Environment's continuous development the drivers update more often than the bundle releases, in order to keep up with those changes in the OpenShift release 4.12.0 has been introduced a new feature called Red Hat CoreOS layering, which automates the kernel installation. 

In order to build the Red Hat CoreOS container base image layer there are a set of minimal requirements to be met before proceeding which are highlighted below.

❗Be advised that the following values are an example representation for the purpose of this article, in your case the values might differ. 

### Requirements:

- podman version: 4.2.0

- Red Hat Enterprise Linux 8.7 (Ootpa)

## Environment Setup

It is assumed that we are intending to install a OpenShift Container Platform version 4.12.0 in any supported configuration (Single Node or Multiple Node). The following configuration can be applied in two stages:

- During the installation of the cluster, by having the yaml file in the manifests directory, or
  
- As a post-configuration of the cluster.

## Step 0. Obtaining the base RHCOS image

In order to build the container base image that will serve as the RHCOS layer which is containing our demo kernel fix, we need to use the same base RHCOS image as the one presented in the OpenShift Container Platform version we intend to install on the cluster or the one we already have it installed. 

To do so, here is how we can obtain the respective image:

- If the OpenShift Container Platform its already installed, use the following command:

```bash
$ oc adm release info --image-for rhel-coreos-8
Warning: the default reading order of registry auth file will be changed from "${HOME}/.docker/config.json" to podman registry config locations in the future version of oc. "${HOME}/.docker/config.json" is deprecated, but can still be used for storing credentials as a fallback. See https://github.com/containers/image/blob/main/docs/containers-auth.json.5.md for the order of podman registry config locations. 
quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:6db665511f305ef230a2c752d836fe073e80550dc21cede3c55cf44db01db365
```
- If the OpenShift Container Platform its not installed, use the following command:

```bash
$ export OCP_VERSION="4.12.0"
$ curl -s https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$OCP_VERSION/release.txt | grep -m1 'rhel-coreos-8' | awk -F ' ' '{print $2}'
quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:6db665511f305ef230a2c752d836fe073e80550dc21cede3c55cf44db01db365
```

As you can observe in the above outputs both commands offer the same expected output, this is serving for later use as the base container image in creating the Red Hat CoreOS layer.

## Step 1. Creating the Containerfile

Once we have obtain the above step base container base image for the desired OpenShift Container Platform we can proceed in building the Containerfile as below:

```bash
# Using a 4.12.0 image 
FROM quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:6db665511f305ef230a2c752d836fe073e80550dc21cede3c55cf44db01db365 
RUN rpm-ostree cliwrap install-to-root / 
#Install hotfix rpm 
RUN rpm-ostree override replace https://people.redhat.com/midu/kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64/kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64.rpm https://people.redhat.com/midu/kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64/kernel-core-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64.rpm https://people.redhat.com/midu/kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64/kernel-modules-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64.rpm https://people.redhat.com/midu/kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64/kernel-modules-extra-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64.rpm && rpm-ostree cleanup -m 

```

Building the container base image using the above Containerfile:

```bash
$ podman build -t side-kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64:latest . --no-cache
```

## Step 2. Upload the build image to your offline Registry

At this step, the layer image is available to your development host, and can be checked with the following command:

```bash
$ podman images
REPOSITORY                                                                   TAG         IMAGE ID      CREATED       SIZE
localhost/side-kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64  latest      2873c04ee007  5 days ago    3.13 GB
```

Now it's the moment where we can upload the image to the Offline Registry:

```bash
$ podman tag localhost/side-kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64:latest inbacrnrdl0102.offline.redhat.lan:5051/midu/side-kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64:latest
$ podman push inbacrnrdl0102.offline.redhat.lan:5051/midu/side-kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64:latest
```

To validate that the image exists in the Offline Registry, use the following command:

```bash
$ curl -X GET -u <username>:<password> https://inbacrnrdl0102.offline.redhat.lan:5051/v2/_catalog --insecure | jq .
{
  "repositories": [
    …
    "midu/side-kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64",
    …
  ]
}
```

## Step 3. Creating the MachineConfig 

At this step, we are going to proceed in creating the MachineConfig and apply it to the cluster, please note that the nodes will perform an immediate restart one-by-one in order to apply the specific change. The MachineConfig file format should respect the template highlighted in [1] and below:

- MachineConfig for the worker nodes:

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  labels:
    machineconfiguration.openshift.io/role: worker 
  name: worker-os-layer-hotfix
spec:
  osImageURL: inbacrnrdl0102.offline.redhat.lan:5051/midu/side-kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64:latest
```

- MachineConfig for the master nodes:

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  labels:
    machineconfiguration.openshift.io/role: master
  name: master-os-layer-hotfix
spec:
  osImageURL: inbacrnrdl0102.offline.redhat.lan:5051/midu/side-kernel-4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64:latest
```

To apply the above MachineConfigs we will have to follow the following command:

```bash
$ oc create -f worker-kernel-machine-config.yaml 
machineconfig.machineconfiguration.openshift.io/worker-os-layer-hotfix created
```

```bash
$ oc create -f master-kernel-machine-config.yaml 
machineconfig.machineconfiguration.openshift.io/master-os-layer-hotfix created
```

## Step 4. Checking the cluster

At this step, after the MachineConfig was applied we are going to validate the changes that are applied to the cluster. Below we are going to highlight the process for an OpenShift Cluster Platform with multiple nodes.

Using the below command we are checking that the MachineConfig Operator its updating the nodes:

```bash
$ oc get mcp
NAME     CONFIG             UPDATED   UPDATING   DEGRADED   MACHINECOUNT   READYMACHINECOUNT   UPDATEDMACHINECOUNT   DEGRADEDMACHINECOUNT   AGE
master   rendered-master-   False     True       False      3              0                   0                     0                      33m
worker   rendered-worker-   False     True       False      2              2                   2                     0                      33m
```



Using the below command we are validating that each node its evacuating the workload and restarts in order to apply the new configuration:

```bash
$ oc get nodes
NAME                                  STATUS                     ROLES                  AGE   VERSION
someone-test-ctlplane-0.test412.com   Ready                      control-plane,master   36m   v1.25.4+77bec7a
someone-test-ctlplane-1.test412.com   Ready,SchedulingDisabled   control-plane,master   36m   v1.25.4+77bec7a
someone-test-ctlplane-2.test412.com   Ready                      control-plane,master   36m   v1.25.4+77bec7a
someone-test-worker-0.test412.com     Ready                      worker                 20m   v1.25.4+77bec7a
someone-test-worker-1.test412.com     Ready                      worker                 22m   v1.25.4+77bec7a
```



Please note that the above command output will change in time. Once each individual node will resume the configuration update, to validate the new RHCOS layer it's been applied we can use the below command:

- Before any change its applied:

```bash
$ sudo ssh core@192.168.122.127
The authenticity of host '192.168.122.127 (192.168.122.127)' can't be established.
Red Hat Enterprise Linux CoreOS 412.86.202301061548-0
  Part of OpenShift 4.12, RHCOS is a Kubernetes native operating system
  managed by the Machine Config Operator (clusteroperator/machine-config).

WARNING: Direct SSH access to machines is not recommended; instead,
make configuration changes via machineconfig objects:
  https://docs.openshift.com/container-platform/4.12/architecture/architecture-rhcos.html

[core@someone-test-worker-0 ~]$ sudo -i
[root@someone-test-worker-0 ~]# uname -r
4.18.0-372.40.1.el8_6.x86_64
```

- After the MachineConfig change its applied:

```bash
$ sudo ssh core@192.168.122.127
The authenticity of host '192.168.122.127 (192.168.122.127)' can't be established.
Red Hat Enterprise Linux CoreOS 412.86.202301061548-0
  Part of OpenShift 4.12, RHCOS is a Kubernetes native operating system
  managed by the Machine Config Operator (clusteroperator/machine-config).

WARNING: Direct SSH access to machines is not recommended; instead,
make configuration changes via machineconfig objects:
  https://docs.openshift.com/container-platform/4.12/architecture/architecture-rhcos.html

---
[core@someone-test-worker-0 ~]$ sudo -i
[root@someone-test-worker-0 ~]# uname -r
4.18.0-372.40.1.el8_6.iavf.bz2149746.bz2152493.x86_64
```


## References

[1] https://docs.openshift.com/container-platform/4.12/post_installation_configuration/coreos-layering.html