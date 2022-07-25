---
layout: post
title:  "Automating offline mirror for Openshift 4!"
date:   2022-07-25 12:32:29 +0200
categories: openshift4
---
In the following post, we are going to talk about how to automate the Offline mirroring for Openshift 4

Prerequisites

-




Step 1. Mirroring the OCP container base images

{% highlight bash %}
 #!/usr/bin/env bash

set -euo pipefail

PRIMARY_NIC=$(ls -1 /sys/class/net | grep 'eth\|en' | head -1)
export PATH=/root/bin:$PATH
export PULL_SECRET="/root/openshift_pull.json"
export IP=$(ip -o addr show $PRIMARY_NIC | head -1 | awk '{print $4}' | cut -d'/' -f1)
REGISTRY_NAME=$(echo $IP | sed 's/\./-/g' | sed 's/:/-/g').sslip.io
REGISTRY_PORT=5000

TAG=4.8.46
OCP_REPO=ocp
export OPENSHIFT_RELEASE_IMAGE=$(curl -s https://mirror.openshift.com/pub/openshift-v4/clients/$OCP_REPO/$TAG/release.txt | grep 'Pull From: quay.io' | awk -F ' ' '{print $3}')
export LOCAL_REG="$REGISTRY_NAME:$REGISTRY_PORT"
export OCP_RELEASE=$(/root/bin/openshift-baremetal-install version | head -1 | cut -d' ' -f2)-x86_64
time oc adm release mirror -a $PULL_SECRET --from=$OPENSHIFT_RELEASE_IMAGE --to-release-image=${LOCAL_REG}/ocp4:${OCP_RELEASE} --to=${LOCAL_REG}/ocp4

if [ "$(grep imageContentSources /root/install-config.yaml)" == "" ] ; then
cat << EOF >> /root/install-config.yaml
imageContentSources:
- mirrors:
  - $REGISTRY_NAME:$REGISTRY_PORT/ocp4
  source: quay.io/openshift-release-dev/ocp-v4.0-art-dev
- mirrors:
  - $REGISTRY_NAME:$REGISTRY_PORT/ocp4
  source: quay.io/openshift-release-dev/ocp-release
EOF
else
  IMAGECONTENTSOURCES="- mirrors:\n  - $REGISTRY_NAME:$REGISTRY_PORT/ocp4\n  source: quay.io/openshift-release-dev/ocp-v4.0-art-dev\n- mirrors:\n  - $REGISTRY_NAME:$REGISTRY_PORT/ocp4\n  source: registry.ci.openshift.org/ocp/release"
  sed -i "/imageContentSources/a${IMAGECONTENTSOURCES}" /root/install-config.yaml
fi

if [ "$(grep additionalTrustBundle /root/install-config.yaml)" == "" ] ; then
  echo "additionalTrustBundle: |" >> /root/install-config.yaml
  sed -e 's/^/  /' /opt/registry/certs/domain.crt >>  /root/install-config.yaml
else
  LOCALCERT="-----BEGIN CERTIFICATE-----\n $(grep -v CERTIFICATE /opt/registry/certs/domain.crt | tr -d '[:space:]')\n -----END CERTIFICATE-----"
  sed -i "/additionalTrustBundle/a${LOCALCERT}" /root/install-config.yaml
  sed -i 's/^-----BEGIN/ -----BEGIN/' /root/install-config.yaml
fi
echo $REGISTRY_NAME:$REGISTRY_PORT/ocp4:$OCP_RELEASE > /root/version.txt

if [ "$(grep pullSecret /root/install-config.yaml)" == "" ] ; then
DISCONNECTED_PULLSECRET=$(cat /root/disconnected_pull.json | tr -d [:space:])
echo -e "pullSecret: |\n  $DISCONNECTED_PULLSECRET" >> /root/install-config.yaml
fi

cp /root/machineconfigs/99-operatorhub.yaml /root/manifests

{% endhighlight %}

Step 2. 
{% highlight bash %}
 #!/usr/bin/env bash

# Variables to set, suit to your installation
export RH_OP_PACKAGES=${RH_OP_PACKAGES:-ocs-operator,local-storage-operator,file-integrity-operator}
export CERT_OP_PACKAGES=${CERT_OP_PACKAGES:-}
export COMMUNITY_OP_PACKAGES=${COMMUNITY_OP_PACKAGES:-}
export MARKETPLACE_OP_PACKAGES=${MARKETPLACE_OP_PACKAGES:-}
if [ -z $RH_OP_PACKAGES ] && [ -z $CERT_OP_PACKAGES ] [ -z $COMMUNITY_OP_PACKAGES ] && [ -z $MARKETPLACE_OP_PACKAGES ]; then
 echo You need one of the following env variables at least: RH_OP_PACKAGES CERT_OP_PACKAGES COMMUNITY_OP_PACKAGES MARKETPLACE_OP_PACKAGES
 exit 1
fi
cd /root
export PATH=/root/bin:$PATH
export OCP_RELEASE="$(/root/bin/openshift-baremetal-install version | head -1 | cut -d' ' -f2 | cut -d'.' -f 1,2)"
export OCP_PULLSECRET_AUTHFILE='/root/openshift_pull.json'
PRIMARY_NIC=$(ls -1 /sys/class/net | grep 'eth\|en' | head -1)
IP=$(ip -o addr show $PRIMARY_NIC | head -1 | awk '{print $4}' | cut -d'/' -f1)
REGISTRY_NAME=$(echo $IP | sed 's/\./-/g' | sed 's/:/-/g').sslip.io
REGISTRY_PORT=5000
export LOCAL_REGISTRY=$REGISTRY_NAME:$REGISTRY_PORT
export IMAGE_TAG=olm

# Add extra registry keys
curl -o /etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-isv https://www.redhat.com/security/data/55A34A82.txt
jq ".transports.docker += {\"registry.redhat.io/redhat/certified-operator-index\": [{\"type\": \"signedBy\",\"keyType\": \"GPGKeys\",\"keyPath\": \"/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-isv\"}], \"registry.redhat.io/redhat/community-operator-index\": [{\"type\": \"signedBy\",\"keyType\": \"GPGKeys\",\"keyPath\": \"/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-isv\"}], \"registry.redhat.io/redhat/redhat-marketplace-operator-index\": [{\"type\": \"signedBy\",\"keyType\": \"GPGKeys\",\"keyPath\": \"/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-isv\"}]}" < /etc/containers/policy.json > /etc/containers/policy.json.new
mv /etc/containers/policy.json.new /etc/containers/policy.json

# Login registries
REGISTRY_USER=dummy
REGISTRY_PASSWORD=dummy
podman login -u $REGISTRY_USER -p $REGISTRY_PASSWORD $LOCAL_REGISTRY
#podman login registry.redhat.io --authfile /root/openshift_pull.json
REDHAT_CREDS=$(cat /root/openshift_pull.json | jq .auths.\"registry.redhat.io\".auth -r | base64 -d)
RHN_USER=$(echo $REDHAT_CREDS | cut -d: -f1)
RHN_PASSWORD=$(echo $REDHAT_CREDS | cut -d: -f2)
podman login -u "$RHN_USER" -p "$RHN_PASSWORD" registry.redhat.io

which opm >/dev/null 2>&1
if [ "$?" != "0" ] ; then
curl -k -s https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/latest/opm-linux.tar.gz | tar xvz -C /usr/bin/
chmod u+x /usr/bin/opm
fi

export RH_OP_INDEX="registry.redhat.io/redhat/redhat-operator-index:v${OCP_RELEASE}"
export CERT_OP_INDEX="registry.redhat.io/redhat/certified-operator-index:v${OCP_RELEASE}"
export COMM_OP_INDEX="registry.redhat.io/redhat/community-operator-index:v${OCP_RELEASE}"
export MARKETPLACE_OP_INDEX="registry.redhat.io/redhat-marketplace-index:v${OCP_RELEASE}"

if [ ! -z $RH_OP_PACKAGES ] ; then
 rm -rf manifests-redhat-operator-index-* || true
 export RH_INDEX_TAG=olm-index/redhat-operator-index:v$OCP_RELEASE
 time opm index prune --from-index $RH_OP_INDEX --packages $RH_OP_PACKAGES --tag $LOCAL_REGISTRY/$RH_INDEX_TAG
 podman push $LOCAL_REGISTRY/$RH_INDEX_TAG --authfile $OCP_PULLSECRET_AUTHFILE
 time oc adm catalog mirror $LOCAL_REGISTRY/$RH_INDEX_TAG $LOCAL_REGISTRY/$IMAGE_TAG --registry-config=$OCP_PULLSECRET_AUTHFILE --max-per-registry=100
 oc apply -f /root/manifests-redhat-operator-index-*/imageContentSourcePolicy.yaml 2>/dev/null || cp /root/manifests-redhat-operator-index-*/imageContentSourcePolicy.yaml /root/manifests/redhat-imageContentSourcePolicy.yaml
 oc apply -f /root/manifests-redhat-operator-index-*/catalogSource.yaml 2>/dev/null || cp /root/manifests-redhat-operator-index-*/catalogSource.yaml /root/manifests/redhat-catalogSource.yaml
fi

if [ ! -z $CERT_OP_PACKAGES ] ; then
 rm -rf manifests-certified-operator-index-* || true
 export CERT_INDEX_TAG=olm-index/certified-operator-index:v$OCP_RELEASE
 time opm index prune --from-index $CERT_OP_INDEX --packages $CERT_OP_PACKAGES --tag $LOCAL_REGISTRY/$CERT_INDEX_TAG
 podman push $LOCAL_REGISTRY/$CERT_INDEX_TAG --authfile $OCP_PULLSECRET_AUTHFILE
 time oc adm catalog mirror $LOCAL_REGISTRY/$CERT_INDEX_TAG $LOCAL_REGISTRY/$IMAGE_TAG --registry-config=$OCP_PULLSECRET_AUTHFILE --max-per-registry=100
 oc apply -f /root/manifests-certified-operator-index-*/imageContentSourcePolicy.yaml 2>/dev/null || cp /root/manifests-certified-operator-index-*/imageContentSourcePolicy.yaml /root/manifests/certified-imageContentSourcePolicy.yaml
 oc apply -f /root/manifests-certified-operator-index-*/catalogSource.yaml 2>/dev/null || cp /root/manifests-certified-operator-index-*/catalogSource.yaml /root/manifests/certified-catalogSource.yaml
fi

if [ ! -z $COMM_OP_PACKAGES ] ; then
 rm -rf manifests-community-operator-index-* || true
 export COMM_INDEX_TAG=olm-index/community-operator-index:v$OCP_RELEASE
 time opm index prune --from-index $COMM_OP_INDEX --packages $COMM_OP_PACKAGES --tag $LOCAL_REGISTRY/$COMM_INDEX_TAG
 podman push $LOCAL_REGISTRY/$COMM_INDEX_TAG --authfile $OCP_PULLSECRET_AUTHFILE
 time oc adm catalog mirror $LOCAL_REGISTRY/$COMM_INDEX_TAG $LOCAL_REGISTRY/$IMAGE_TAG --registry-config=$OCP_PULLSECRET_AUTHFILE --max-per-registry=100
 oc apply -f /root/manifests-community-operator-index-*/imageContentSourcePolicy.yaml 2>/dev/null || cp /root/manifests-community-operator-index-*/imageContentSourcePolicy.yaml /root/manifests/community-imageContentSourcePolicy.yaml
 oc apply -f /root/manifests-community-operator-index-*/catalogSource.yaml 2>/dev/null || cp /root/manifests-community-operator-index-*/catalogSource.yaml /root/manifests/community-catalogSource.yaml
fi

if [ ! -z $MARKETPLACE_OP_PACKAGES ] ; then
 rm -rf manifests-redhat-marketplace-operator-index-* || true
 export MARKETPLACE_INDEX_TAG=olm-index/redhat-marketplace-operator-index:v$OCP_RELEASE
 time opm index prune --from-index $MARKETPLACE_OP_INDEX --packages $MARKETPLACE_OP_PACKAGES --tag $LOCAL_REGISTRY/$MARKETPLACE_INDEX_TAG
 podman push $LOCAL_REGISTRY/$MARKETPLACE_INDEX_TAG --authfile $OCP_PULLSECRET_AUTHFILE
 time oc adm catalog mirror $LOCAL_REGISTRY/$MARKETPLACE_INDEX_TAG $LOCAL_REGISTRY/$IMAGE_TAG --registry-config=$OCP_PULLSECRET_AUTHFILE --max-per-registry=100
 oc apply -f /root/manifests-redhat-marketplace-operator-index-*/imageContentSourcePolicy.yaml 2>/dev/null || cp /root/manifests-redhat-marketplace-operator-index-*/imageContentSourcePolicy.yaml /root/manifests/redhat-marketplace-imageContentSourcePolicy.yaml
 oc apply -f /root/manifests-redhat-marketplace-operator-index-*/catalogSource.yaml 2>/dev/null || cp /root/manifests-redhat-marketplace-operator-index-*/catalogSource.yaml /root/manifests/redhat-marketplace-catalogSource.yaml
fi
{% endhighlight %}
