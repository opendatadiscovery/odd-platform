# Visibility for Data Quality Engineer

**Key words**:  data quality metrics, Great Expectations, Pandas profiling, custom DQ frameworks.
### Challenge
As a Quality Assurance Engineer, I cannot cover all data quality monitoring activities. I know that some book orders can be mapped to wrong dimensions or even miss crucial fields associated with an order. I want to automate the DQ monitoring process and have a place where my team and our users can monitor pipeline health on a given day.
### Solution
The ODD Platform is compatible with Great Expectations and Pandas Profiling. Users can [import test suite results](Features.md#data-quality-test-results-import), both pre-defined Great Expectations PyLibs and custom DQ DAGs.
### Scenario
1. My team’s pipeline is processing more then two billion of books orders daily and uses two OLTP systems and ten dimensional tables as its sources.
2. I want to check the following DQ KPIs based on six DQ dimensions concept: \
 - **Timeliness**: how much time does it take for an order to become available in my product? \
 - **Completeness**: do I have any missing values in the most crucial fields, e.g. date, book ID, amount, etc.? \
 - **Uniqueness**: do I have any duplicated book orders in my dataset? \
 - **Validity**: do the values comply with expected value format, e.g. book ISBN has an expected number of digits? \
 - **Consistency**: when I do a lookup on dimensional table to return a book name, do I get all book IDs covered? \
 - **Accuracy**: does my sales data reconcile with other sources?
3. By knowing that ODD is compatible with Great Expectations and therefore Pandas Profiling PyLibs, I decide to cover KPIs in the Timeliness, Completeness, Uniqueness and Validity dimensions by these open source libraries.
4. As for the Consistency and Accuracy dimensions, I need to compare several profiles (datasets), which is not possible in Great Expectations / Pandas Profiling PyLibs. I develop a simple SQL script to calculate the KPIs.
5. I import test suite results from Great Expectations to ODD.
6. As ODD allows a DQ import not only from pre-defined libraries but also from custom frameworks, I add my custom test suite results to the Platform as well.
7. I can expose all my DQ KPIs to the ODD Platform and share it with my stakeholders: both my team and my users.

**Result**: I provide a transparent and accessible way of pipeline health monitoring  and also use this feature when assessing reliability of other sources of my interest.
