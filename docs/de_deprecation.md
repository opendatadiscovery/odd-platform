# Deprecation for Data Engineer \ Analyst 
**Key words**: divestiture, communication process, identifying stakeholders.
### Challenge
As a Data Engineer, I initiate a deprecation process and have to deprecate my data objects mitigating the risks of other pipelines failing.

As a Data Analyst, I have found an outdated data object on books catalogue that my team has inherited from a legacy team. I know that it is of a poor quality and takes significant resources of my team to maintain it. I want to deprecate it and can't predict the consequences. 

### Solution
The ODD Platform provides a [lineage diagram](Features.md#end-to-end-data-objects-lineage) to examine data flows and possibility of marking data owners so that deprecation process goes smoothly.
### Scenario
1. My team has inherited a data object from a legacy team describing books (ISBN, code, author, publisher).
2. We examined the object and found out that it has not been updated for almost a year due to pipeline failovers and therefore does not contain recent book releases. \
I have strong doubts that expenses on storage, calculation and team support can be justified.
3. I need to ensure that divestiture won’t impose downstream system failure or block my users: \
 - As a Data analyst, I log in to the ODD Platform to find the stakeholders, SMEs or primary PoCs of the object in doubt. \
 - As a Data Engineer, I explore a lineage diagram to check whether there are any  downstream systems sourcing from the object in doubt (pipelines, dashboards, views).
4. I find out that though there is a dashboard sourcing from my object, it was not used for 6 months.
5. We decide to hold a session with stakeholders listed in ODD to double-check my findings and notify them about divestiture.
6. We send out a notification letter that this data object is going to be decommissioned in 3 months.
7. We archive the object and stop object increments;
8. After 3 months we delete the object, DAGs and archive the code base.

**Result**: Deprecation process is well-managed, all users are notified in advance and risks mitigated.