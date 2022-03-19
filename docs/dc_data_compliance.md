# Data compliance for Data Scientists
**Key words**: Personal Identifiable Information (PII), General Data Protection Regulation (GDPR), confidential data, anonymization.
### Challenge
As a Data Scientist, I have a task to develop a ML-model for customer segmentation purposes. It aims at introducing customer tiers to customize communication for each segment. \
During model developing I need confidential and personal information of my customer to attribute my tiers right. I do not know if I have to anonymize the data or I can use it as-is as my model will be used internally only. 

### Solution
The ODD Platform provides a PII-sensitive search mechanism to assist in identifying confidential data using [tags](Features.md#manual-object-tagging), labels and [metadata](Features.md#metadata-storage) and, therefore, preventing potential monetary, legal or reputational losses.
### Scenario
1. I start developing a new ML-model. Its data source has to have the following parameters: \
 - Customer age, gender, LTV (Lifetime Value), delivery address \
 - Customer payment details (card issuer, account's currency, card type) \
 - Transaction timestamp, payment type (card or cash) \
 - Preferred genres and authors

2. I find the following objects in the sources: \
 - `Dim_Customers`: customer full name, date of birth,  delivery address \
 - `Dim_Books`: ISBN, author and genre \
 - `Dim_Cards`: customer, card, card issuer name and currency \
 - `Fct_transactions`: transaction date, book, payment type, transaction amount, quantity, currency, customer and card \
 - `Dim_currency`: currency ISO3 code, currency name \
 - `Dim_payment_types`: payment type, payment type description \
 3. I have designed ways of joining the above tables but do not know if I should anonymize any data.
 4. I go to the ODD Platform and start searching for the tables I need.
5. I check objects’ tags, labels and metadata.
6. I find out that `Dim_Customers` and `Dim_Cards` objects cannot be stored. Customer full name, age, address and payment details should be anonymized as these are PII data protected by GDPR and PCI DSS. 

**Result**: ML-model meets GDPR, PCI DSS and company’s compliance standards.


