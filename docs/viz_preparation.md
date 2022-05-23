# Data preparation for Visualization Engineer

**Key words**: BI tool, data chart, performance tuning, data preparation, data load mode,  dashboard security level, underlying data.
### Challenge
I am a Viz Engineer in a team that develops and maintains Tableau dashboards for book orders reporting and ad hoc monitoring of online store performance.
I got a task from my stakeholders to introduce a dashboard that tracks digital inventory during high demand (Black Friday, Christmas or Valentines Day) and stays stable if 5+ people use the report simultaneously. Dashboard is expected to be refreshed near-real-time. 

To build the dashboards I have to know the nature of the data since the majority of BI tools do not support complicated data preparation algorithms. I need to spend a lot of time on manual analysis of meta data and basic profiling.
### Solution
The ODD Platform [tagging system](Features.md#manual-object-tagging) and [meta data storage](Features.md#metadata-storage) can be consulted during dashboard development to reach better performance and set security standards, e.g. row-level security based on the user group.
### Scenario
1. I examine my data source metadata and tags in ODD and find out that it is: \
 - Set to streaming data load mode. \
 - Does not have the KPIs I need but I might be able to calculate them using existing fields. \
 - Has a history depth of ten calendar year. \
 - Contains all sales data, not just the one of customers subscribed to a newsletter. \
 - Has denormalized structure.
2. I understand that if I establish a connection from Tableau to a data source as-is, a performance will be very poor and definitely won’t satisfy the near-real-time refresh requirement.
3. I decide to introduce the following data preparation steps: 
    - I will develop a view that’ll have customers subscribed to a newsletter data only.
    - I will limit the history depth to one day only (run date) as it is an operational, not analytical dashboard.
   - I will select only the fields that I need for my dashboard.
   - I will pre-calculate all KPIs in my view to increase dashboard performance (set calculation recourses on DWH side and not on Tableau as BI tools of this type work best with prepared and pre-aggregated data).

**Result**: I can prevent any collapses during high demand periods when the company requires operational data being reliable and accessible every minute.
