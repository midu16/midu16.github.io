---
layout: post
title:  "Control Plane - User Plane separation for Openshift 4!"
date:   2022-08-24 10:00:29 +0200
categories: openshift4
---
In the following post, we are going to talk on how to create a Control and User Plane separation on Openshift 4 using physical different Network Cards on the hosts.

Prerequisites

- OCPv4.10.X
- IPI installer
- Downloaded pull-secret.txt file
- oc-cli available on the BastionVM
- openshift-baremetal-install available on the BastionVM

Step 1. Day 1 operations

- Creating the manifests structure files:

{% highlight bash %}
 openshift-baremetal-install --dir ${HOME}/clusterconfigs/ create manifests
{% endhighlight %}

- How to enable the ovs local-gw mode on day1:

{% highlight bash %}
 cat ${HOME}/clusterconfigs/manifests/cluster-network-03-config.yml
 ---
 apiVersion: operator.openshift.io/v1
 kind: Network
 metadata:
  creationTimestamp: null
  name: cluster
 spec:
  defaultNetwork:
      	type: OVNKubernetes
      	ovnKubernetesConfig:
              	mtu: 1400
              	genevePort: 6081
              	gatewayConfig:
                      	routingViaHost: true
{% endhighlight %}

- The ${HOME}/clusterconfigs structure before installation:
{% highlight bash %}
clusterconfigs/
├── manifests
│   ├── cluster-config.yaml
│   ├── cluster-dns-02-config.yml
│   ├── cluster-infrastructure-02-config.yml
│   ├── cluster-ingress-02-config.yml
│   ├── cluster-network-01-crd.yml
│   ├── cluster-network-02-config.yml
│   ├── cluster-network-03-config.yml
│   ├── cluster-proxy-01-config.yaml
│   ├── cluster-scheduler-02-config.yml
│   ├── cvo-overrides.yaml
│   ├── kube-cloud-config.yaml
│   ├── kube-system-configmap-root-ca.yaml
│   ├── machine-config-server-tls-secret.yaml
│   └── openshift-config-secret-pull-secret.yaml
└── openshift
	├── 99_baremetal-provisioning-config.yaml
	├── 99_kubeadmin-password-secret.yaml
	├── 99_openshift-cluster-api_host-bmc-secrets-0.yaml
	├── 99_openshift-cluster-api_host-bmc-secrets-1.yaml
	├── 99_openshift-cluster-api_host-bmc-secrets-2.yaml
	├── 99_openshift-cluster-api_host-bmc-secrets-3.yaml
	├── 99_openshift-cluster-api_host-bmc-secrets-4.yaml
	├── 99_openshift-cluster-api_hosts-0.yaml
	├── 99_openshift-cluster-api_hosts-1.yaml
	├── 99_openshift-cluster-api_hosts-2.yaml
	├── 99_openshift-cluster-api_hosts-3.yaml
	├── 99_openshift-cluster-api_hosts-4.yaml
	├── 99_openshift-cluster-api_master-machines-0.yaml
	├── 99_openshift-cluster-api_master-machines-1.yaml
	├── 99_openshift-cluster-api_master-machines-2.yaml
	├── 99_openshift-cluster-api_master-user-data-secret.yaml
	├── 99_openshift-cluster-api_worker-machineset-0.yaml
	├── 99_openshift-cluster-api_worker-user-data-secret.yaml
	├── 99_openshift-machineconfig_99-master-ssh.yaml
	├── 99_openshift-machineconfig_99-worker-ssh.yaml
	└── openshift-install-manifests.yaml

2 directories, 35 files
{% endhighlight %}

- Start the installation:


{% highlight bash %}
 openshift-baremetal-install --dir ${HOME}/clusterconfigs/ --log-level debug create cluster
{% endhighlight %}


Note: If you already have a deployed cluster, BUT you want to enable the ovs local-gw mode on it, you can use the below command:


{% highlight bash %}
 oc patch network.operator cluster -p '{"spec":{"defaultNetwork":{"ovnKubernetesConfig":{"gatewayConfig":{"routingViaHost": true}}}}}' --type=merge
{% endhighlight %}

