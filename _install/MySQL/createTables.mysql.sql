CREATE DATABASE `addrBook` CHARACTER SET utf8 COLLATE utf8_general_ci;
use `addrBook`;

CREATE TABLE users (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `login` CHAR(30) NOT NULL,
    `password` CHAR(30) NOT NULL,
    `avatarUrl` CHAR(255),
    UNIQUE (`login`),
    PRIMARY KEY (`id`)
);

INSERT INTO users (`login`, `password`) VALUES ('usr', 'pwd');
INSERT INTO users (`login`, `password`) VALUES ('m0n', 'pwd');
SELECT * FROM users;

CREATE TABLE groups (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11) NOT NULL,
    `name` CHAR(30) NOT NULL,
    `rank` INT(9) NOT NULL DEFAULT 2,
    FOREIGN KEY (user_id)
        REFERENCES users (id),
    UNIQUE (`user_id`, `name`),
    PRIMARY KEY (`id`)
);

INSERT INTO groups (`user_id`, `name`, `rank`) VALUES ('1', 'Favourites', 1);
INSERT INTO groups (`user_id`, `name`, `rank`) VALUES ('1', 'Family', 2);
INSERT INTO groups (`user_id`, `name`, `rank`) VALUES ('1', 'job_1', 2);
INSERT INTO groups (`user_id`, `name`, `rank`) VALUES ('1', 'job_2', 2);
INSERT INTO groups (`user_id`, `name`, `rank`) VALUES ('2', 'Favourites', 1);
select * from groups where user_id = 1 order by rank, name;

CREATE TABLE contacts (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11) NOT NULL,
    `group_id` INT(11),
    `email` CHAR(50),
    `phone` CHAR(50),
    `firstName` CHAR(50) NOT NULL,
    `lastName` CHAR(50),
    FOREIGN KEY (user_id)
        REFERENCES users (id),
    FOREIGN KEY (group_id)
        REFERENCES groups (id)
        ON DELETE SET NULL,
    PRIMARY KEY (`id`)
);

INSERT INTO contacts (`user_id`, `email`,             `phone`, `firstName`, `lastName`) VALUES ('1', '1',      '+38 (063) 344-21-21', 'Mykola', 'Grybyk');
INSERT INTO contacts (`user_id`, `email`,             `phone`, `firstName`, `lastName`) VALUES ('1', '2',      '+38 (063) 344-21-21', 'Mykola', 'Grybyk');
INSERT INTO contacts (`user_id`, `group_id`, `email`, `phone`, `firstName`, `lastName`) VALUES ('1', '1', '3', '+38 (063) 344-21-21', 'Mykola', 'Grybyk');
INSERT INTO contacts (`user_id`, `group_id`, `email`, `phone`, `firstName`            ) VALUES ('1', '2', '4', '+38 (063) 344-21-21', 'mum');
INSERT INTO contacts (`user_id`, `group_id`, `email`, `phone`, `firstName`            ) VALUES ('1', '2', '5', '+38 (063) 344-21-21', 'dad');
INSERT INTO contacts (`user_id`, `group_id`, `email`, `phone`, `firstName`            ) VALUES ('1', '3', '6', '+38 (063) 344-21-21', 'worker1');
INSERT INTO contacts (`user_id`, `group_id`, `email`, `phone`, `firstName`            ) VALUES ('1', '3', '6', '+38 (063) 344-21-21', 'worker2');
INSERT INTO contacts (`user_id`, `group_id`, `email`, `phone`, `firstName`            ) VALUES ('1', '3', '6', '+38 (063) 344-21-21', 'worker3');
INSERT INTO contacts (`user_id`, `group_id`, `email`, `phone`, `firstName`            ) VALUES ('1', '3', '6', '+38 (063) 344-21-21', 'worker4');
INSERT INTO contacts (`user_id`, `group_id`, `email`, `phone`, `firstName`            ) VALUES ('1', '3', '6', '+38 (063) 344-21-21', 'worker5');
INSERT INTO contacts (`user_id`, `group_id`, `email`, `phone`, `firstName`            ) VALUES ('1', '3', '6', '+38 (063) 344-21-21', 'worker6');
INSERT INTO contacts (`user_id`, `group_id`, `email`, `phone`, `firstName`            ) VALUES ('1', '3', '6', '+38 (063) 344-21-21', 'worker7');
SELECT * FROM contacts where user_id = 1 order by firstName, lastName;
SELECT * FROM contacts where group_id = 3 order by firstName, lastName;
