---
title: "Hugo Website ,AWS code pipeline , and Git"
# page_header_bg: "images/banner/BenchmarkBanner.jpg"
slug: "hugo-website-aws-code-pipeline-and-git"
date: 2022-05-07T12:27:17+06:00
draft: false
# Main description
image: "/images/blog/hugo-website-aws-code-pipeline-and-git/cicd-pipeline.png"
bg_image: "/images/blog/hugo-website-aws-code-pipeline-and-git/cicd-pipeline.png"
blogtitle: "Building a CI/CD pipeline for Hugo websites in AWS"
blogdescription: "Hugo is a fast, modern static website builder written in Go, designed to make building websites fun again. Hugo is a general purpose website framework..."
# meta description
description : "Performance and Load Testing, Penetration Testing, Deployment Architecture Review, Static Code Analysis"
metakeywords: "This is meta keywords"
categories: ["Performance testing"]
tags: ["Stress testing", "Endurance testing", "Spike testing", "Volume testing", "Scalability testing"]
types: "blogs"
---


###

**Contents:**

[What is Hugo?](#what-is-hugo)

[What is AWS CI/CD Pipeline?](#what-is-aws-cicd-pipeline)

[Why do we need to use AWS CI/CD Pipeline?](#why-do-we-need-to-use-aws-cicd-pipeline)

[AWS and CI/CD pipelines tools](#aws-and-cicd-pipelines-tools)  

[How CodePipeline works](#how-codepipeline-works)

[Prerequisites](#prerequisites)

[Implementation](#implementation) 

[Summary](#summary) 

### What is Hugo? ###

Hugo is a fast, modern static website builder written in Go, designed to make building websites fun again. Hugo is a general purpose website framework. Technically, Hugo is a static site builder. Unlike systems that dynamically build pages on each visitor request, Hugo builds pages as you create or update content.

Hugo-built websites are very quick and safe. Hugo websites can be hosted on a variety of platforms, including Netlify, Heroku, GoDaddy, DreamHost, GitHub Pages, GitLab Pages, Surge, Firebase, Google Cloud Storage, Amazon S3, Rackspace, Azure, and CloudFront. They also integrate well with CDNs. Hugo webpages function without a database or reliance on pricey runtimes like Ruby, Python, or PHP.

Learn more about Hugo with this given link : [What is Hugo | Hugo (gohugo.io)](https://gohugo.io/about/what-is-hugo/)


### What is AWS CI/CD Pipeline? ###

In AWS CodePipeline, the build, test, and deploy phases of the release process are automated every time there is a code change. CodePipeline automates the entire release process and provides fast and reliable infrastructure and application updates.

This enables you to rapidly and reliably deliver features and updates. As a result, you can quickly and reliably deliver features and updates to your customers. AWS CodePipeline can be integrated with third-party services such as GitHub or your own custom plugin. With AWS CodePipeline, you only pay for what you use. You do not have to pay upfront fees or sign long-term contracts.

### Why do we need to use AWS CI/CD Pipeline? ###

Here is the benefits of using AWS CI/CD Pipeline :

### Focusing resources on important aspects of CI/CD: ###

Resources (developers, budget, time) need to be balanced with business constraints (time to market, deadline, runway). With CI/CD pipelines, costs and complexity can be reduced.

**Rapid Delivery:**

Using an automated build, test, and release procedure allows you to detect bugs as soon as they are small and easy to fix. Every change should go through your staging and release process to ensure quality.

**Fast And Easy Start:**

With AWS CodePipeline, you can immediately begin to model your software release process. It is not necessary to provision or set up servers. Powered by your existing systems and tools, CodePipeline provides a full-service continuous delivery solution.

**Easy to merge:**

AWS CodePipeline can be easily extended to meet your specific needs. You can use pre-built plugins or your own custom plugins at every step of the publishing process. For example, you can pull source code from GitHub, use a local Jenkins build server, use a third-party service for load testing, or feed deployment information to custom operations dashboards.

**Configurable workflow:**

AWS CodePipeline lets you model different stages of your software release process using the console interface, AWS CLI, AWS CloudFormation, or AWS SDKs. You can easily specify which tests to run and customize the procedure for deploying your application and its dependencies.

### AWS and CI/CD pipelines tools: ###

Since AWS is the leading cloud provider, it has its own set of tools for deploying CI/CD, which allow you to combine multiple resources in a single pipeline, which can be configured and monitored easily.

**AWS CodeBuild:**

Its main job is to fetch the source code, compile it, run tests, and perform any other manipulations required for producing the final build, referred to as artifacts. Several simplified cases can also be handled by this service for deployment, which we will examine further below.

**AWS CodeDeploy:**

A service with a self-explanatory name that is responsible for running deployment processes. The artifacts produced by CodeBuild are usually delivered to the corresponding environment by it.

**AWS CodePipeline:**

Here, It is like a configurable wrapper for all the above services. CI/CD pipelines are created by linking the above services together-even with third-party services if needed.

### How CodePipeline works: ###

![image-1](/images/blog/hugo-website-aws-code-pipeline-and-git/image-1.png)

![image-2](/images/blog/hugo-website-aws-code-pipeline-and-git/image-2.png)

**Reference: [Amazon Web Services](https://aws.amazon.com/)**

### Prerequisites: ###

+ You use the Hugo framework for your website.
+ You have an AWS account.
+ You have administrative access to create resources in your AWS account.
+ You have your own Git Repository.
+ You have deployed your website using Amazon S3 Bucket  and CloudFront Distribution.

To know How to deploy your website using S3 Bucket and CloudFront, Here is the link : 
[Use CloudFront to serve a static website hosted on Amazon S3 ](https://aws.amazon.com/premiumsupport/knowledge-center/cloudfront-serve-static-website/#:~:text=To%20use%20HTTPS%20for%20connections%20between%20CloudFront%20and,Endpoint%20of%20your%20bucket%20without%20the%20leading%20http%3A%2F%2F.)

### Implementation: ###

Before going to the AWS console, We need to make sure that our project's root folder contains the build specification file, which is a YAML-based collection of build commands and related settings that CodeBuild uses. By default this file name is “buildspec.yml” . The following code block shows the contents of the file.

version: 0.2
 
phases:
  install:
   
    runtime-versions:
      nodejs: 16
    commands:
      - apt-get update
      - echo Installing hugo
      - curl -L -o hugo.deb https://github.com/gohugoio/hugo/releases/download/v0.101.0/hugo_extended_0.101.0_Linux-64bit.deb
      - dpkg -i hugo.deb
  pre_build:

    commands:
      - echo In pre_build phase..
      - echo Current directory is $CODEBUILD_SRC_DIR
      - ls -la
  build:

    commands:
      - hugo -v
      
  
artifacts:

  files:

    - '**/*'
  base-directory: public

The following are the three phases defined in the build specification file.

**1)** **Install** : Runs commands to install the Hugo package with a runtime environment using Python 3.8.

**2)** **Pre-build** : CodeBuild runs commands to ensure that the project's source code has been successfully copied to your environment.

**3)** **Build** : Provides commands for creating static websites in your Hugo project. Using hugo -v, all generated files and folders are stored in the current working directory in a public folder.

**Now, Go to the AWS Console, login and open the CodePipeline page.** 

**Now, Click on Create Pipeline and give name to your pipeline and click Next.**

![image-3](/images/blog/hugo-website-aws-code-pipeline-and-git/image-3.png)

**Now, In source provider select Github and connect to your repository.**

![image-4](/images/blog/hugo-website-aws-code-pipeline-and-git/image-4.png)

![image-5](/images/blog/hugo-website-aws-code-pipeline-and-git/image-5.png)

**Click on next and you will be redirected to the build stage. Select AWS CodeBuild , region and if you have already created the build stage then you can select your project and click on Next, if not then click on create project.**

![image-6](/images/blog/hugo-website-aws-code-pipeline-and-git/image-6.png)

![image-7](/images/blog/hugo-website-aws-code-pipeline-and-git/image-7.png)

**Configure the environment.**

![image-8](/images/blog/hugo-website-aws-code-pipeline-and-git/image-8.png)

![image-9](/images/blog/hugo-website-aws-code-pipeline-and-git/image-9.png)

**If you have given some other name of your yml file then you have to mention the file name.**

**Click on continue to pipeline.**

![image-10](/images/blog/hugo-website-aws-code-pipeline-and-git/image-10.png)

**Click on next.**

![image-11](/images/blog/hugo-website-aws-code-pipeline-and-git/image-11.png)

**Now, select your S3 Bucket and click next.**

**Review your configuration and click on create pipeline.**

![image-12](/images/blog/hugo-website-aws-code-pipeline-and-git/image-12.png)

Here, Our Hugo website is successfully deployed. Try pushing any changes to the repository, wait a few seconds, and reload the pipeline page to see a new build is in progress, indicating that it was triggered automatically! 

Now, As we are using CloudFront distribution and after each deployment we have to do invalidation to clear cache. To solve this, we can add stages to the Code pipeline using lambda function. Here is the link :  [AWS: Creating a CloudFront Invalidation in CodePipeline using Lambda Actions | by Jacob Unna | FullStackAI | Medium](https://medium.com/fullstackai/aws-creating-a-cloudfront-invalidation-in-codepipeline-using-lambda-actions-49c1fd3a3c31)

### Summary: ###

In this blog post, I explained how to use AWS CodePipeline, AWS CodeBuild, and Amazon S3 to automate the content publishing of a Hugo-based website. With this pipeline, your static websites will be built efficiently and updated consistently using the Hugo framework.

**Reference : [Building a CI/CD pipeline for Hugo websites | Integration & Automation (amazon.com)](https://aws.amazon.com/blogs/infrastructure-and-automation/building-a-ci-cd-pipeline-for-hugo-websites/)**






###