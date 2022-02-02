# Use cases
## Data compliance for Data Scientists
**Key words**: Personal Identifiable Information (PII), confidential data, anonymization, bank secrecy.
### Challenge
As a DS in finance or banking company I have to develop an ML-model for marketing purposes. It aims to introduce customer segments as well as customize communication for each segment. \
Developing the model I deal with PII. It requires to choose confidential info and then anonymize it in order to avoid monetary, legal or reputation losses.
### Solution
The ODD Platform provides sensitive search mechanism which helps to look for sensitive data using [tags](GLOSSARY.md#tag), labels and metadata.
### Scenario
1. 
I am a DS in a finance/banking sector company
I have a task to develop a predictive ML model to introduce customer segments (clustering) for marketing so that they can customize communication for each and every segment
I am searching for a data source for my ML model that will at least have:
 Customer age, gender, LTV, country and city of contract
 Customer accounts information (number of accounts, accounts’ currency)
 Monthly earnings and spending, savings
 Monthly cashback amounts and selected cashback categories
 Transaction categories, MCCs
 Transaction timestamp, latitude and longitude
 Transaction types (debit, credit)
I have found the following objects in DWH:
 Dim_Customers: customer full name, date of birth, customer ID and preferred Geo details filled in during    registration process
 Fact_transactions: transaction timestamp, , latitude and longitude, transaction type ID, transaction amount, currency Id, customer Id
 Dim_currency: currency Id, currency ISO3 code, currency name, effective date, expiration date
 Dim_transaction_types: transaction type ID, transaction type code, transaction type description
 Dim_rates: currency Id, currency ISO3 code, LC to EUR rate, LC to USD rate
I have designed a star schema to join the above tables, requested the accesses, but do not know if I should anonymize any data;
I am opening an ODD platform and start searching for the tables I need 
I check objects’ tags, labels and meta data
I find out that Dim_Customers object can’t be stored, customer full name, date of birth and customer ID should be anonymized as these are PII data protected by GDPR 
I introduce hashing to comply with GDPR and company’s compliance standards to avoid monetary/legal/reputation losses
