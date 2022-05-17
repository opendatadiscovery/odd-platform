# ODD Platform Soft Delete practices for relation entities
* Status: accepted 
* Deciders: Damir Abdullin, Nikita Dementev
* Date: 2022-05-17

## Glossary
* Relation entity - entity that defines relation between two or more entities. Usually represented by M-M tables in the database. E.g. `tag_to_data_entity`, `label_to_dataset_field`, etc
* Main entity - domain entity managed by user (tags, namespaces, etc)

## Context and Problem Statement

We need to ground rules about soft delete practices for each relation entity in the ODD Platform

Assumptions:
* All main entities already have soft-delete practices designed and out of the scope of this document

## Considered Options

* Do not delete relation entities at all, keep them in the database
* Add soft delete for relation entities (`deleted_at` column in the relation database table)

## Decision Outcome

Chosen option: "Add soft delete for relation entities", because

* We will be able to restore the whole state by the user request
* We will be able to track a history for the whole state and not just for the main entity
