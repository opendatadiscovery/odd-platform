create table users (
    id bigint,
    name varchar,
    gender varchar,
    birthdate timestamp,
    address text,
    phone varchar,
    email varchar
);

create table clients (
    id bigint,
    name varchar,
    status varchar,
    logo_url varchar,
    foundation_date timestamp,
    information text
);

create table groups(
    id bigint,
    name varchar,
    description text,
    logo_url varchar,
    links varchar[],
    user_admin_id bigint,
    support_id bigint
);


create table user_group_relation(
    user_id bigint,
    group_id bigint, 
    relation_type int
);

create table payments(
    id bigint,
    processor_id bigint,
    information text,
    user_id bigint,
    product_id bigint,
    amount decimal,
    type varchar
);

create table reviews(
    user_id bigint,
    product_id bigint,
    score decimal,
    review text,
    review_date timestamp,
    photo_urls varchar[]
);

create table creditors(
    id bigint,
    name varchar,
    legal_document_url varchar,
    score decimal,
    api_link varchar
);

create view user_view as 
    select 
        1 as user_id,
        1 as user_name,
        1 as client_id,
        1 as average_spent,
        1 as medium_spent,
        1 as min_spent,
        1 as max_spent,
        1 as credit_score,
        1 as total_reviews
    from 
        users, clients, reviews, creditors
    ;

create view client_view as 
    select 
        1 as client_id,
        1 as client_name,
        1 as users_involved_count,
        1 as users_average_spent,
        1 as average_price
    from
        user_view, payments
    ;

create view creditor_view as 
    select 
        1 as creditor_id,
        1 as creditor_name,
        1 as average_user_loan,
        1 as most_popular_payment_type
    from
        user_view, payments
    ;
