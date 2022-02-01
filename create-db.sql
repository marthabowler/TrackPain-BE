create table conditions (
condition_name text unique,
condition_id serial PRIMARY KEY
) 

create table painkillers(
painkiller_id serial PRIMARY KEY,
painkiller_name text
)

create table pain(
pain_id serial PRIMARY KEY,
time timestamp default now(),
seriousness int, 
condition_id int,
painkiller_id int default 1,
user_id int default 1,
FOREIGN KEY(condition_id)
REFERENCES conditions(condition_id),
FOREIGN KEY(painkiller_id)
REFERENCES painkillers(painkiller_id),
FOREIGN KEY(user_id)
REFERENCES users(user_id)
) 

create table painkillers_taken(
painkiller_id int, 
FOREIGN KEY(painkiller_id)
REFERENCES painkillers(painkiller_id),
painkillers_taken_id serial PRIMARY KEY,
condition_id int,
REFERENCES conditions(condition_id),
FOREIGN KEY(painkiller_id)
)

create table users (
username text,
user_id serial PRIMARY KEY,
weight number,
height number,
gender text, 
sex text
)

create table symptoms (
symptom_id serial PRIMARY KEY,
symptom_name text
)

create table conditions_symptoms (
    condition_id number 
    FOREIGN KEY(condition_id)
REFERENCES conditions(condition_id),
symptom_id number,
FOREIGN KEY(symptom_id)
    REFERENCES symptoms(symptom_id)

)