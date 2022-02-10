# Data compliance for Data Scientists
**Key words**: Personal Identifiable Information (PII), General Data Protection Regulation (GDPR), confidential data, anonymization, bank secrecy.
### Challenge
As a DS in finance or banking company I have to develop an ML-model for marketing purposes. It aims to introduce customer segments as well as customize communication for each segment. \
Developing the model I deal with PII. It requires to choose confidential info and then anonymize it in order to avoid monetary, legal or reputation losses.
### Solution
The ODD Platform provides sensitive search mechanism which helps to look for sensitive data using tags, labels and metadata.
### Scenario
1. A DS creates an ML-model. It's data source has to have the parameters: \
- Customer age, gender, LTV (Lifetime Value), country and city of contract \
- Customer accounts information (number of accounts, accounts’ currency) \
- Monthly earnings and spending, savings \
- Monthly cashback amounts and selected cashback categories \
 - Transaction categories, MCCs (Merchant category codes) \
 - Transaction timestamp, latitude and longitude \
- Transaction types (debit, credit). 
2. I have found the following objects in a DWH: \
- `Dim_Customers`: customer full name, date of birth, customer ID and preferred Geo details filled in during    registration process \
- `Fact_transactions`: transaction timestamp,  latitude and longitude, transaction type ID, transaction amount, currency Id, customer Id \
- `Dim_currency`: currency Id, currency ISO3 code, currency name, effective date, expiration date \
- `Dim_transaction_types`: transaction type ID, transaction type code, transaction type description \
- `Dim_rates`: currency Id, currency ISO3 code, LC to EUR rate, LC to USD rate 
3. I have designed ways of joining the above tables, requested the accesses, but do not know if I should anonymize any data;
4. I go to the ODD Platform and start searching for the tables I need: \
- I check objects’ tags, labels and meta data \
- I find out that `Dim_Customers` object can’t be stored, customer full name, date of birth and customer ID should be anonymized as these are PII data protected by GDPR. \
**Result**: A process of application this ML-model meets GDPR and company’s compliance standards. 
