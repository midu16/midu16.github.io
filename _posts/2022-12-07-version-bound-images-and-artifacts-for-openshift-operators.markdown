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
