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

Once the installation is finished, the cluster status should be as displayed below:

{% highlight bash %}
oc get nodes
NAME         STATUS   ROLES    AGE     VERSION
cu-master1   Ready    master   38m     v1.23.5+012e945
cu-master2   Ready    master   37m     v1.23.5+012e945
cu-master3   Ready    master   37m     v1.23.5+012e945
hub-node1    Ready    worker   9m41s   v1.23.5+012e945
hub-node2    Ready    worker   3m1s    v1.23.5+012e945
hub-node3    Ready    worker   4m10s   v1.23.5+012e945
{% endhighlight %}


Step 2. Day 2 operations

Install the NMStateOperator:

{% highlight bash %}
cat << EOF | oc apply -f -
 apiVersion: v1
 kind: Namespace
 metadata:
   labels:
     kubernetes.io/metadata.name: openshift-nmstate
     name: openshift-nmstate
   name: openshift-nmstate
 spec:
   finalizers:
   - kubernetes
 EOF
namespace/openshift-nmstate created
{% endhighlight %}

{% highlight bash %}
cat << EOF | oc apply -f -
 apiVersion: operators.coreos.com/v1
 kind: OperatorGroup
 metadata:
   annotations:
     olm.providedAPIs: NMState.v1.nmstate.io
   generateName: openshift-nmstate-
   name: openshift-nmstate-tn6k8
   namespace: openshift-nmstate
 spec:
   targetNamespaces:
   - openshift-nmstate
 EOF
operatorgroup.operators.coreos.com/openshift-nmstate-tn6k8 created
{% endhighlight %}

{% highlight bash %}
cat << EOF| oc apply -f -
 apiVersion: operators.coreos.com/v1alpha1
 kind: Subscription
 metadata:
   labels:
     operators.coreos.com/kubernetes-nmstate-operator.openshift-nmstate: ""
   name: kubernetes-nmstate-operator
   namespace: openshift-nmstate
 spec:
   channel: stable
   installPlanApproval: Automatic
   name: kubernetes-nmstate-operator
   source: redhat-operators
   sourceNamespace: openshift-marketplace
 EOF
subscription.operators.coreos.com/kubernetes-nmstate-operator created
{% endhighlight %}

{% highlight bash %}
cat << EOF | oc apply -f -
 apiVersion: nmstate.io/v1
 kind: NMState
 metadata:
   name: nmstate
 EOF
nmstate.nmstate.io/nmstate created
{% endhighlight %}

Validating that the installation has succeeded:

{% highlight bash %}
oc get clusterserviceversion -n openshift-nmstate -o custom-columns=Name:.metadata.name,Phase:.status.phase
Name                                              Phase
kubernetes-nmstate-operator.4.10.0-202207291908   Succeeded
{% endhighlight %}

Check [more documentation on NMStateOperator for Openshiftv4.10][nmstateoperator-documentation].

[nmstateoperator-documentation]: https://docs.openshift.com/container-platform/4.10/networking/k8s_nmstate/k8s-nmstate-about-the-k8s-nmstate-operator.html

Make sure that all the available worker nodes has the same NIC installed:
{% highlight bash %}
ssh core@hub-node1 "ifconfig ens7f0"
ens7f0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether 04:3f:72:f0:15:3a  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
{% endhighlight %}

{% highlight bash %}
ssh core@hub-node2 "ifconfig ens7f0"
ens7f0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        ether 04:3f:72:f0:15:32  txqueuelen 1000  (Ethernet)
        RX packets 21896  bytes 4478396 (4.2 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 4672  bytes 797924 (779.2 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
{% endhighlight %}

{% highlight bash %}
ssh core@hub-node3 "ifconfig ens7f0"
ens7f0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        ether 04:3f:72:f0:15:3e  txqueuelen 1000  (Ethernet)
        RX packets 21917  bytes 4478172 (4.2 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 4646  bytes 794340 (775.7 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
{% endhighlight %}


The IP assigment for each Worker node for `ens7f0` interface:

| Hostname   | Interface | IP Address Allocation | Netmask       |
| ---------- | --------- | --------------------- | ------------- |
| hub-node1  | ens7f0    | 192.168.111.2         | 255.255.255.0 |
| hub-node2  | ens7f0    | 192.168.111.3         | 255.255.255.0 |
| hub-node3  | ens7f0    | 192.168.111.4         | 255.255.255.0 |

The IP assigment for each Worker node for `ens7f1` interface:

| Hostname   | Interface | IP Address Allocation | Netmask       |
| ---------- | --------- | --------------------- | ------------- |
| hub-node1  | ens7f1    | 10.10.10.2            | 255.255.255.0 |
| hub-node2  | ens7f1    | 10.10.10.3            | 255.255.255.0 |
| hub-node3  | ens7f1    | 10.10.10.4            | 255.255.255.0 |

Now that we confirmed we have the same NIC available on all the worker nodes, we will proceed in configuring the interface by using the NMStateOperator:

- `ens7f0`:
  
{% highlight bash %}
---
apiVersion: nmstate.io/v1
kind: NodeNetworkConfigurationPolicy
metadata:
  name: br-ex-ens7f0-policy-<node_hostname>
spec:
  nodeSelector:
    kubernetes.io/hostname: <node_hostname>
  desiredState:
    interfaces:
      - name: br-ex-ens7f0
        description: Linux bridge with ens7f0 as a port
        type: linux-bridge
        state: up
        ipv4:
          address:
          - ip: 192.168.111.X
            prefix-length: 24
          enabled: true
        bridge:
          options:
            stp:
              enabled: false
          port:
            - name: ens7f0
        mtu: 1400
{% endhighlight %}

- `ens7f1`: 

{% highlight bash %}
---
apiVersion: nmstate.io/v1
kind: NodeNetworkConfigurationPolicy
metadata:
  name: br-ex-ens7f1-policy-<node_hostname>
spec:
  nodeSelector:
    kubernetes.io/hostname: <node_hostname>
  desiredState:
    interfaces:
      - name: br-ex-ens7f1
        description: Linux bridge with ens7f1 as a port
        type: linux-bridge
        state: up
        ipv4:
          address:
          - ip: 10.10.10.X
            prefix-length: 24
          enabled: true
        bridge:
          options:
            stp:
              enabled: false
          port:
            - name: ens7f1
        mtu: 1400
{% endhighlight %}

[OVNKubernetes-documentation]: https://access.redhat.com/documentation/en-us/openshift_container_platform/4.9/html/networking/multiple-networks

Configuring IP failover for the additional interface OCPv4.10

For more documentation on [Configuring IP failover for additional interface OCPv4.10][vip-failover]

[vip-failover]: https://docs.openshift.com/container-platform/4.10/networking/configuring-ipfailover.html

Create an IP failover service account:
{% highlight bash %}
oc create sa ipfailover
{% endhighlight %}

Update security context constraints for `hostNetwork`:
{% highlight bash %}
oc adm policy add-scc-to-user privileged -z ipfailover
oc adm policy add-scc-to-user hostnetwork -z ipfailover
{% endhighlight %}

Create a deployment yaml file to configure IP:
{% highlight yaml %}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nb-ipfailover-keepalived
  labels:
    ipfailover: nb-openshift
spec:
  strategy:
    type: Recreate
  replicas: 2
  selector:
    matchLabels:
      ipfailover: nb-openshift
  template:
    metadata:
      labels:
        ipfailover: nb-openshift
    spec:
      serviceAccountName: ipfailover
      privileged: true
      hostNetwork: true
      nodeSelector:
        node-role.kubernetes.io/worker: ""
      containers:
      - name: openshift-ipfailover
        image: quay.io/openshift/origin-keepalived-ipfailover
        ports:
        - containerPort: 63000
          hostPort: 63000
        imagePullPolicy: IfNotPresent
        securityContext:
          privileged: true
        volumeMounts:
        - name: lib-modules
          mountPath: /lib/modules
          readOnly: true
        - name: host-slash
          mountPath: /host
          readOnly: true
          mountPropagation: HostToContainer
        - name: etc-sysconfig
          mountPath: /etc/sysconfig
          readOnly: true
        - name: config-volume
          mountPath: /etc/keepalive
        env:
        - name: OPENSHIFT_HA_CONFIG_NAME
          value: "ipfailover"
        - name: OPENSHIFT_HA_VIRTUAL_IPS
          value: "192.168.111.1"
        - name: OPENSHIFT_HA_VIP_GROUPS
          value: "10"
        - name: OPENSHIFT_HA_NETWORK_INTERFACE
          value: "ens7f0" #The host interface to assign the VIPs
        - name: OPENSHIFT_HA_MONITOR_PORT
          value: "30060"
        - name: OPENSHIFT_HA_VRRP_ID_OFFSET
          value: "0"
        - name: OPENSHIFT_HA_REPLICA_COUNT
          value: "2" #Must match the number of replicas in the deployment
        - name: OPENSHIFT_HA_USE_UNICAST
          value: "false"
        #- name: OPENSHIFT_HA_UNICAST_PEERS
          #value: "10.0.148.40,10.0.160.234,10.0.199.110"
        - name: OPENSHIFT_HA_IPTABLES_CHAIN
          value: "INPUT"
        #- name: OPENSHIFT_HA_NOTIFY_SCRIPT
        #  value: /etc/keepalive/mynotifyscript.sh
        - name: OPENSHIFT_HA

When a Virtual IP (VIP) on a node leaves the fault state by passing the check script, the VIP on the node enters the backup state if it has lower priority than the VIP on the node that is currently in the master state. However, if the VIP on the node that is leaving fault state has a higher priority, the preemption strategy determines its role in the cluster.

The nopreempt strategy does not move master from the lower priority VIP on the host to the higher priority VIP on the host. With preempt_delay 300, the default, Keepalived waits the specified 300 seconds and moves master to the higher priority VIP on the host.
_CHECK_SCRIPT
          value: "/etc/keepalive/mycheckscript.sh"
        - name: OPENSHIFT_HA_PREEMPTION
          value: "preempt_delay 300"
        - name: OPENSHIFT_HA_CHECK_INTERVAL
          value: "2"
        livenessProbe:
          initialDelaySeconds: 10
          exec:
            command:
            - pgrep
            - keepalived
      volumes:
      - name: lib-modules
        hostPath:
          path: /lib/modules
      - name: host-slash
        hostPath:
          path: /
      - name: etc-sysconfig
        hostPath:
          path: /etc/sysconfig
      # config-volume contains the check script
      # created with `oc create configmap keepalived-checkscript --from-file=mycheckscript.sh`
      - configMap:
          defaultMode: 0755
          name: keepalived-checkscript
        name: config-volume
      imagePullSecrets:
        - name: openshift-pull-secret
{% endhighlight %}

Configuring check and notify scripts

Keepalived monitors the health of the application by periodically running an optional user supplied check script. For example, the script can test a web server by issuing a request and verifying the response.

When a check script is not provided, a simple default script is run that tests the TCP connection. This default test is suppressed when the monitor port is 0.

- `mycheckscript.sh`:
{% highlight bash %}
#!/bin/bash
    # Whatever tests are needed
    # E.g., send request and verify response
exit 0
{% endhighlight %}

- Create the config map:

{% highlight bash %}
oc create configmap mycustomcheck --from-file=mycheckscript.sh
{% endhighlight %}

Configuring VRRP preemption

When a Virtual IP (VIP) on a node leaves the fault state by passing the check script, the VIP on the node enters the backup state if it has lower priority than the VIP on the node that is currently in the master state. However, if the VIP on the node that is leaving fault state has a higher priority, the preemption strategy determines its role in the cluster.

The nopreempt strategy does not move master from the lower priority VIP on the host to the higher priority VIP on the host. With preempt_delay 300, the default, Keepalived waits the specified 300 seconds and moves master to the higher priority VIP on the host.


NOTE : If you are using OpenShift Container Platform health checks, the nature of IP failover and groups means that all instances in the group are not checked. For that reason, the [Kubernetes health checks must be used to ensure that services are live][K8s-health-checks].

[K8s-health-checks]: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

Step 3. Applying the MachineConfig 

In this step, we are going to apply the Machineconfig.yaml file to configure on the `worker-nodes` routes the traffic from the `pods-network-subnet` to the `Northbound interface` and `Southbound interface`.

![OCP flow Architecture](/assets/images/cu-separation.png)


By applying the routing config, we are going to send specific traffic from the pods in charge of the `NorthBound` processing and the traffic from the pods in charge of the `SouthBound` processing to the corespoding interface. This will allow the `UserPlane` traffic from the pods hoasted on the worker nodes from the worker nodes through a dedicated interface withouth applying any rules at this moment. Any traffic rules can be applied on the edge switch.

Step 4. Workflow architecture

![OCP IPI Workflow Architecture](/assets/images/NetworkSegregation.drawio.png)

Once the `Step 2` it has been finished, you should have the above workflow architecture implemented. 
