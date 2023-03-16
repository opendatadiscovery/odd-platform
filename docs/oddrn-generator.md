---
description: ODDRN-Generator, what is it and why we are using it?
---

# ODDRN-Generator

ODDRN generator- it is a resource, which helps us solve the problem of data loss, simplify the work of your system with metadata.\


The creation of the ODDRN happens by the collector, in different collectors generators ODDRN are generated the same way, an ID number is assigned in these different collectors- one, the reason why the id number is the same is the path of metadata. We will tell you more about the path og metadata later, and also demonstrate that you have a complete understanding of the ODDRN generator and its work.\
Due to the fact that, is the same ID number in the collectors, the data in the two collectors are combined and sent to the ODD Platform.

### Important notice

In order for the ODDRN generators to be created correctly, the next data is needed:\
\
\-Connection Info (for example: in the YAML config- host, port)\
\-The names of the tables, jobs, entities (that we get at the time of the metadata request from the DataSource)\
\
We also recommend you indicate in the collector in the type connection- DNS in all collectors or the IP address also in all collectors, the choice of one type connection in the collectors is recommended for the correct work of the ODDRN generator



### To summarize our recommendation

All collectors with a DNS type connection or all collectors with an IP address type connection are recommended, collectors with a different type of connection are recommended not to use.

### Metadata path and visual representation of the work ODDRN-Generator&#x20;

Let's see at circuitry, which will help you visually understand the work of the ODDRN-Generator and the system of the metadata path.

<figure><img src=".gitbook/assets/image.png" alt=""><figcaption></figcaption></figure>

We see two collectors, a data path, and also the information about collectors, which is transmitted directly to the ODD Platform.\
"id" in "Collector GCP" will be the same with "dataset\_ids" in "Collector Tableau".\
Also in the circuitry we demonstrated the finding of the ODDRN- Generator.
