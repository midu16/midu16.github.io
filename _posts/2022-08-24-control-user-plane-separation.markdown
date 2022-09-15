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
NAME         STATUS   ROLES    AGE   VERSION           INTERNAL-IP     EXTERNAL-IP   OS-IMAGE                                                        KERNEL-VERSION                 CONTAINER-RUNTIME
cu-master1   Ready    master   28h   v1.23.5+012e945   192.168.34.51   <none>        Red Hat Enterprise Linux CoreOS 410.84.202207140725-0 (Ootpa)   4.18.0-305.49.1.el8_4.x86_64   cri-o://1.23.3-10.rhaos4.10.git84a5d4b.el8
cu-master2   Ready    master   28h   v1.23.5+012e945   192.168.34.52   <none>        Red Hat Enterprise Linux CoreOS 410.84.202207140725-0 (Ootpa)   4.18.0-305.49.1.el8_4.x86_64   cri-o://1.23.3-10.rhaos4.10.git84a5d4b.el8
cu-master3   Ready    master   28h   v1.23.5+012e945   192.168.34.53   <none>        Red Hat Enterprise Linux CoreOS 410.84.202207140725-0 (Ootpa)   4.18.0-305.49.1.el8_4.x86_64   cri-o://1.23.3-10.rhaos4.10.git84a5d4b.el8
hub-node1    Ready    worker   28h   v1.23.5+012e945   192.168.34.31   <none>        Red Hat Enterprise Linux CoreOS 410.84.202207140725-0 (Ootpa)   4.18.0-305.49.1.el8_4.x86_64   cri-o://1.23.3-10.rhaos4.10.git84a5d4b.el8
hub-node2    Ready    worker   28h   v1.23.5+012e945   192.168.34.32   <none>        Red Hat Enterprise Linux CoreOS 410.84.202207140725-0 (Ootpa)   4.18.0-305.49.1.el8_4.x86_64   cri-o://1.23.3-10.rhaos4.10.git84a5d4b.el8
hub-node3    Ready    worker   28h   v1.23.5+012e945   192.168.34.33   <none>        Red Hat Enterprise Linux CoreOS 410.84.202207140725-0 (Ootpa)   4.18.0-305.49.1.el8_4.x86_64   cri-o://1.23.3-10.rhaos4.10.git84a5d4b.el8
{% endhighlight %}


Step 2. Day 2 operations

- Install the NMStateOperator steb-by-step:

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


- Install the NMStateOperator all-in-one:

{% highlight yaml %}
---
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
---
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
---
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
---
apiVersion: nmstate.io/v1
kind: NMState
metadata:
 name: nmstate
---
{% endhighlight %}

- Validating that the installation has succeeded:

{% highlight bash %}
oc get clusterserviceversion -n openshift-nmstate -o custom-columns=Name:.metadata.name,Phase:.status.phase
Name                                              Phase
kubernetes-nmstate-operator.4.10.0-202207291908   Succeeded
{% endhighlight %}

Check [more documentation on NMStateOperator for Openshiftv4.10][nmstateoperator-documentation].

[nmstateoperator-documentation]: https://docs.openshift.com/container-platform/4.10/networking/k8s_nmstate/k8s-nmstate-about-the-k8s-nmstate-operator.html

The NMStateOperator status from the `web-console`

![NMStateOperator Status from web-console](/assets/images/Screenshot 2022-09-14 at 17-18-22 Installed Operators · Red Hat OpenShift Container Platform.png)

The NMStateOperator pods state from the `web-console`

![NMStateOperator pods status from web-console](/assets/images/Screenshot 2022-09-14 at 17-18-57 Pods · Red Hat OpenShift Container Platform.png)

- Make sure that all the available worker nodes has the same NIC installed:
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


Once created the files, we will proceed by creating the configuration:
{% highlight bash %}
oc create -f br-ex-ens7f0-policy-hub-node1.yaml
nodenetworkconfigurationpolicy.nmstate.io/br-ex-ens7f0-policy-hub-node1 created
oc create -f br-ex-ens7f0-policy-hub-node2.yaml
nodenetworkconfigurationpolicy.nmstate.io/br-ex-ens7f0-policy-hub-node2 created
oc create -f br-ex-ens7f0-policy-hub-node3.yaml
nodenetworkconfigurationpolicy.nmstate.io/br-ex-ens7f0-policy-hub-node3 created
{% endhighlight %}

Validating that the configuration was applied successfully to the nodes:
{% highlight bash %}
oc get NodeNetworkConfigurationPolicy
NAME                            STATUS
br-ex-ens7f0-policy-hub-node1   Available
br-ex-ens7f0-policy-hub-node2   Available
br-ex-ens7f0-policy-hub-node3   Available
{% endhighlight %}

[OVNKubernetes-documentation]: https://access.redhat.com/documentation/en-us/openshift_container_platform/4.9/html/networking/multiple-networks

- Configuring IP failover for the additional interface OCPv4.10

For more documentation on [Configuring IP failover for additional interface OCPv4.10][vip-failover]

[vip-failover]: https://docs.openshift.com/container-platform/4.10/networking/configuring-ipfailover.html

Create an IP failover service account:
{% highlight bash %}
oc create sa ipfailover
{% endhighlight %}

{% highlight bash %}
---
apiVersion: v1
kind: Namespace
metadata:
  name: ipfailover-namespace
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ipfailover
  namespace: ipfailover-namespace
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
  name: ipfailover-keepalived
  labels:
    ipfailover: ens7f0-openshift
spec:
  strategy:
    type: Recreate
  replicas: 3
  selector:
    matchLabels:
      ipfailover: ens7f0-openshift
  template:
    metadata:
      labels:
        ipfailover: ens7f0-openshift
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
          value: "br-ex-ens7f0" #The host interface to assign the VIPs
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
        - name: OPENSHIFT_HA_CHECK_SCRIPT
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
oc set env deploy/ipfailover-keepalived OPENSHIFT_HA_CHECK_SCRIPT=/etc/keepalive/mycheckscript.sh
oc set volume deploy/ipfailover-keepalived --add --overwrite --name=config-volume --mount-path=/etc/keepalive --source='{"configMap": { "name": "mycustomcheck", "defaultMode": 493}}'
{% endhighlight %}

- Configuring VRRP preemption

When a Virtual IP (VIP) on a node leaves the fault state by passing the check script, the VIP on the node enters the backup state if it has lower priority than the VIP on the node that is currently in the master state. However, if the VIP on the node that is leaving fault state has a higher priority, the preemption strategy determines its role in the cluster.

The nopreempt strategy does not move master from the lower priority VIP on the host to the higher priority VIP on the host. With preempt_delay 300, the default, Keepalived waits the specified 300 seconds and moves master to the higher priority VIP on the host.


NOTE : If you are using OpenShift Container Platform health checks, the nature of IP failover and groups means that all instances in the group are not checked. For that reason, the [Kubernetes health checks must be used to ensure that services are live][K8s-health-checks].

[K8s-health-checks]: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/


- Checking that the configuration was successfully:
{% highlight bash %}
oc get pods
NAME                                     READY   STATUS    RESTARTS   AGE     IP              NODE        NOMINATED NODE   READINESS GATES
ipfailover-keepalived-866f45865d-c6p7w   1/1     Running   0          3m28s   192.168.34.31   hub-node1   <none>           <none>
ipfailover-keepalived-866f45865d-jxtx2   1/1     Running   0          3m28s   192.168.34.33   hub-node3   <none>           <none>
ipfailover-keepalived-866f45865d-zh79t   1/1     Running   0          3m28s   192.168.34.32   hub-node2   <none>           <none>
{% endhighlight %}

- Validating the `br-ex-ens7f0` interface configuration until this point:
{% highlight bash %}
ssh core@hub-node1 "ip -f inet addr show br-ex-ens7f0"
12: br-ex-ens7f0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1400 qdisc noqueue state DOWN group default qlen 1000
    inet 192.168.111.2/24 brd 192.168.111.255 scope global noprefixroute br-ex-ens7f0
       valid_lft forever preferred_lft forever
{% endhighlight %}

{% highlight bash %}
ssh core@hub-node2 "ip -f inet addr show br-ex-ens7f0"
23: br-ex-ens7f0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1400 qdisc noqueue state UP group default qlen 1000
    inet 192.168.111.3/24 brd 192.168.111.255 scope global noprefixroute br-ex-ens7f0
       valid_lft forever preferred_lft forever
{% endhighlight %}

{% highlight bash %}
ssh core@hub-node3 "ip -f inet addr show br-ex-ens7f0"
28: br-ex-ens7f0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1400 qdisc noqueue state UP group default qlen 1000
    inet 192.168.111.4/24 brd 192.168.111.255 scope global noprefixroute br-ex-ens7f0
       valid_lft forever preferred_lft forever
    inet 192.168.111.1/32 scope global br-ex-ens7f0
       valid_lft forever preferred_lft forever
{% endhighlight %}

We can observe that the VIP has been alocated to `br-ex-ens7f0` interface of hub-node3.

- Validating that the Out-Bound traffic its using as `srcIP: 192.168.111.1`:

Making sure that one of the worker nodes have the VIP associated on the `br-ex-ens7f0` interface:
{% highlight bash %}
ssh core@hub-node3 "ip -f inet addr show br-ex-ens7f0"
28: br-ex-ens7f0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1400 qdisc noqueue state UP group default qlen 1000
    inet 192.168.111.4/24 brd 192.168.111.255 scope global noprefixroute br-ex-ens7f0
       valid_lft forever preferred_lft forever
    inet 192.168.111.1/32 scope global br-ex-ens7f0
       valid_lft forever preferred_lft forever
ssh core@hub-node2 "ip -f inet addr show br-ex-ens7f0"
23: br-ex-ens7f0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1400 qdisc noqueue state UP group default qlen 1000
    inet 192.168.111.3/24 brd 192.168.111.255 scope global noprefixroute br-ex-ens7f0
       valid_lft forever preferred_lft forever
ssh core@hub-node1 "ip -f inet addr show br-ex-ens7f0"
12: br-ex-ens7f0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1400 qdisc noqueue state DOWN group default qlen 1000
    inet 192.168.111.2/24 brd 192.168.111.255 scope global noprefixroute br-ex-ens7f0
       valid_lft forever preferred_lft forever
{% endhighlight %}

On the `hub-node2` listen on the physical `ens7f0` interface traffic and filter by `icmp`:
{% highlight bash %}
tcpdump -i ens7f0 icmp -vvne
dropped privs to tcpdump
tcpdump: listening on ens7f0, link-type EN10MB (Ethernet), capture size 262144 bytes
05:15:00.853295 04:3f:72:f0:15:3e > 04:3f:72:f0:15:32, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 51770, offset 0, flags [DF], proto ICMP (1), length 84)
    192.168.111.1 > 192.168.111.3: ICMP echo request, id 51299, seq 915, length 64
05:15:00.853328 04:3f:72:f0:15:32 > 04:3f:72:f0:15:3e, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 47096, offset 0, flags [none], proto ICMP (1), length 84)
    192.168.111.3 > 192.168.111.1: ICMP echo reply, id 51299, seq 915, length 64
05:15:01.877298 04:3f:72:f0:15:3e > 04:3f:72:f0:15:32, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 52403, offset 0, flags [DF], proto ICMP (1), length 84)
    192.168.111.1 > 192.168.111.3: ICMP echo request, id 51299, seq 916, length 64
05:15:01.877330 04:3f:72:f0:15:32 > 04:3f:72:f0:15:3e, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 47192, offset 0, flags [none], proto ICMP (1), length 84)
    192.168.111.3 > 192.168.111.1: ICMP echo reply, id 51299, seq 916, length 64
05:15:02.901298 04:3f:72:f0:15:3e > 04:3f:72:f0:15:32, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 53189, offset 0, flags [DF], proto ICMP (1), length 84)
    192.168.111.1 > 192.168.111.3: ICMP echo request, id 51299, seq 917, length 64
05:15:02.901331 04:3f:72:f0:15:32 > 04:3f:72:f0:15:3e, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 47629, offset 0, flags [none], proto ICMP (1), length 84)
    192.168.111.3 > 192.168.111.1: ICMP echo reply, id 51299, seq 917, length 64
05:15:03.925295 04:3f:72:f0:15:3e > 04:3f:72:f0:15:32, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 54188, offset 0, flags [DF], proto ICMP (1), length 84)
    192.168.111.1 > 192.168.111.3: ICMP echo request, id 51299, seq 918, length 64
05:15:03.925320 04:3f:72:f0:15:32 > 04:3f:72:f0:15:3e, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 47749, offset 0, flags [none], proto ICMP (1), length 84)
    192.168.111.3 > 192.168.111.1: ICMP echo reply, id 51299, seq 918, length 64
05:15:04.949302 04:3f:72:f0:15:3e > 04:3f:72:f0:15:32, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 54957, offset 0, flags [DF], proto ICMP (1), length 84)
    192.168.111.1 > 192.168.111.3: ICMP echo request, id 51299, seq 919, length 64
05:15:04.949324 04:3f:72:f0:15:32 > 04:3f:72:f0:15:3e, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 48058, offset 0, flags [none], proto ICMP (1), length 84)
    192.168.111.3 > 192.168.111.1: ICMP echo reply, id 51299, seq 919, length 64
05:15:05.973419 04:3f:72:f0:15:3e > 04:3f:72:f0:15:32, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 55575, offset 0, flags [DF], proto ICMP (1), length 84)
    192.168.111.1 > 192.168.111.3: ICMP echo request, id 51299, seq 920, length 64
05:15:05.973451 04:3f:72:f0:15:32 > 04:3f:72:f0:15:3e, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 48492, offset 0, flags [none], proto ICMP (1), length 84)
    192.168.111.3 > 192.168.111.1: ICMP echo reply, id 51299, seq 920, length 64
05:15:06.997299 04:3f:72:f0:15:3e > 04:3f:72:f0:15:32, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 55981, offset 0, flags [DF], proto ICMP (1), length 84)
    192.168.111.1 > 192.168.111.3: ICMP echo request, id 51299, seq 921, length 64
05:15:06.997321 04:3f:72:f0:15:32 > 04:3f:72:f0:15:3e, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 49037, offset 0, flags [none], proto ICMP (1), length 84)
    192.168.111.3 > 192.168.111.1: ICMP echo reply, id 51299, seq 921, length 64
{% endhighlight %}

Source MAC_ADDR:
{% highlight bash %}
ip -f inet addr show br-ex-ens7f0
12: br-ex-ens7f0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1400 qdisc noqueue state UP group default qlen 1000
    link/ether 04:3f:72:f0:15:3e brd ff:ff:ff:ff:ff:ff
     inet 192.168.111.4/24 brd 192.168.111.255 scope global noprefixroute br-ex-ens7f0
       valid_lft forever preferred_lft forever
    inet 192.168.111.1/32 scope global br-ex-ens7f0
       valid_lft forever preferred_lft forever
{% endhighlight %}

Destination MAC_ADDR:
{% highlight bash %}
ip -f inet addr show br-ex-ens7f0
23: br-ex-ens7f0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1400 qdisc noqueue state UP group default qlen 1000
    link/ether 04:3f:72:f0:15:32 brd ff:ff:ff:ff:ff:ff
     inet 192.168.111.3/24 brd 192.168.111.255 scope global noprefixroute br-ex-ens7f0
       valid_lft forever preferred_lft forever
{% endhighlight %}

As we can observe the traffic from the `hub-node3` to `hub-node2` its using as the source IP address the VIP.

Step 3. Applying the MachineConfig

In this step, we are going to apply the Machineconfig.yaml file to configure on the `worker-nodes` routes the traffic from the `pods-network-subnet` to the `Northbound interface` and `Southbound interface`, as well we will maintain the routes for `br-ex-ens7f0` and `br-ex-ens7f1` to use the VIP as the source IP address for the Outbound traffic.


![OCP flow Architecture](/assets/images/cu-separation.png)

By applying the following routing config, we are going to instruct the host routing table to use the VIP as the source IP Address for the Outbound traffic. Since the service is replicated on the nodes, and there is created a High Availability from the cluster perspective, this will allow to have a unified addressing.

Define the static routing imperative definition for `br-ex-ens7f0` :
{% highlight bash %}
ip route add 192.168.111.0/24 dev br-ex-ens7f0 src 192.168.111.1
{% endhighlight %}

Define the static routing imperative definition for `br-ex-ens7f1` :
{% highlight bash %}
ip route add 10.10.10.0/24 dev br-ex-ens7f1 src 10.10.10.1
{% endhighlight %}

Where the address `192.168.111.1` its the VIP for the NorthBound interface and `10.10.10.1` its the VIP for the SouthBound interface.

Define the static routing [declarative definition using MachineConfig][static-routing-with-machine-config] for `br-ex-ens7f0` :

[static-routing-with-machine-config]: https://access.redhat.com/solutions/5423561


By applying the routing config, we are going to send specific traffic from the pods in charge of the `NorthBound` processing and the traffic from the pods in charge of the `SouthBound` processing to the corresponding interface. This will allow the `UserPlane` traffic from the pods hoasted on the worker nodes from the worker nodes through a dedicated interface withouth applying any rules at this moment. Any traffic rules can be applied on the edge switch.

- `NorthBound routing config`:
{% highlight bash %}
iptables -A FORWARD -i ovn-k8s-mp0 -o br-ex-ens7f0 -j ACCEPT -s 192.168.111.1
iptables -A FORWARD -i br-ex-ens7f0 -o ovn-k8s-mp0 -m state -s 192.168.111.1 --state ESTABLISHED,RELATED -j ACCEPT
iptables -t nat -A POSTROUTING -o br-ex-ens7f0 -s 192.168.111.1 -j MASQUERADE
{% endhighlight %}

iptables -t nat -A POSTROUTING -o br-ex-ens7f0 -s 127.0.1.1 -p all -j SNAT --to 192.168.111.1

- `SouthBound routing config`:
{% highlight bash %}
iptables -A FORWARD -i ovn-k8s-mp0 -o br-ex-ens7f1 -j ACCEPT
iptables -A FORWARD -i br-ex-ens7f1 -o ovn-k8s-mp0 -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -t nat -A POSTROUTING -o br-ex-ens7f1 -j MASQUERADE
{% endhighlight %}

- MachineConfig for NorthBound config:
{% highlight yaml %}
---
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  labels:
    machineconfiguration.openshift.io/role: worker
  name: 16-worker-iptables
spec:
  config:
    ignition:
      config: {}
      security:
        tls: {}
      timeouts: {}
      version: 3.2.0
    networkd: {}
    passwd: {}
    systemd:
      units:
        - name: set-iptables-config.service
          enabled: true
          contents: |
            [Unit]
            Description=Set Iptables Config.
            Before=NetworkManager.service etc-NetworkManager-systemConnectionsMerged.mount
            After=systemd-tmpfiles-setup.service

            [Service]
            Type=oneshot
            Environment="EXIT_IFACE='br-ex-ens7f0'"
            ExecStart=/usr/local/bin/set_iptables_config.sh

            [Install]
            WantedBy=multi-user.target
    storage:
      files:
        - filesystem: root
          mode: 493
          path: /usr/local/bin/set_iptables_config.sh
          contents:
            source: data:;base64,IyEvdXNyL2Jpbi9lbnYgYmFzaAoKc2V0IC14ZQoKRVhJVF9JRkFDRT0ke0VYSVRfSUZBQ0U6LSIifQoKaXB0YWJsZXMgLUEgRk9SV0FSRCAtaSBvdm4tazhzLW1wMCAtbyAke0VYSVRfSUZBQ0V9IC1qIEFDQ0VQVAppcHRhYmxlcyAtQSBGT1JXQVJEIC1pICR7RVhJVF9JRkFDRX0gIC0wIG92bi1rOHMtbXAwIC1tIHN0YXRlIC0tc3RhdGUgRVNUQUJMSVNIRUQsUkVMQVRFRCAtaiBBQ0NFUFQ=
{% endhighlight %}

Step 4. Workflow architecture

![OCP IPI Workflow Architecture](/assets/images/NetworkSegregation.drawio.png)

Once the `Step 2` it has been finished, you should have the above workflow architecture implemented.


Step 5. Creating the command-pod for testing

- Namespace and Pod defition object:
{% highlight yaml %}
---
apiVersion: v1
kind: Namespace
metadata:
  name: command-pod-namespace
---
apiVersion: v1
kind: Pod
metadata:
  name: command-pod
  namespace: command-pod-namespace
  labels:
    app: debug-application-pod
spec:
  nodeName: hub-node1
  containers:
  - name: command-pod
    image: quay.io/midu/systat:latest
    command: ['sh', '-c', 'echo The app is running! && sleep 3600']
  restartPolicy: OnFailure
{% endhighlight %}

- Creating the pod on the specific node:
{% highlight bash %}
oc create -f command-pod.yaml
{% endhighlight %}

- Checking that the pod has been successful created:
{% highlight bash %}
oc get pods -n command-pod-namespace
NAME          READY   STATUS    RESTARTS   AGE
command-pod   1/1     Running   0          10s
{% endhighlight %}

- Connecting to the pod terminal:
{% highlight bash %}
oc rsh command-pod -n command-pod-namespace
{% endhighlight %}
