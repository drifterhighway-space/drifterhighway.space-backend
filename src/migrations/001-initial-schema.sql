-- Migration: 001-initial-schema
-- Description: Initialize database with tables for existing models (MariaDB compatible)
CREATE TABLE
    IF NOT EXISTS users (
        ID INT AUTO_INCREMENT,
        Name VARCHAR(255) NOT NULL,
        Status VARCHAR(50) NOT NULL,
        DiscordID VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID)
    );

CREATE TABLE
    IF NOT EXISTS corporations (
        ID INT AUTO_INCREMENT,
        Name VARCHAR(255) NOT NULL,
        Type VARCHAR(50) NOT NULL DEFAULT 'Corporation',
        ParentID INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID)
    );

CREATE TABLE
    IF NOT EXISTS alliances (
        ID INT AUTO_INCREMENT,
        Name VARCHAR(255) NOT NULL,
        Type VARCHAR(50) NOT NULL DEFAULT 'Alliance',
        ParentID INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID)
    );

CREATE TABLE
    IF NOT EXISTS characters (
        ID INT AUTO_INCREMENT,
        User INT NOT NULL,
        Name VARCHAR(255) NOT NULL,
        Corporation INT NOT NULL,
        RefreshToken TEXT,
        AccessToken TEXT,
        Status VARCHAR(50) NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID)
    );

CREATE TABLE
    IF NOT EXISTS tokens (
        ID INT AUTO_INCREMENT,
        UserID INT NOT NULL,
        Token VARCHAR(255) NOT NULL,
        Expires DATETIME NOT NULL,
        Scopes TEXT NOT NULL,
        Type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID)
    );

INSERT INTO
    users (ID, Name, Status)
VALUES
    (0, 'Ibn Khatab', 'Active');

INSERT INTO
    characters (ID, Name, User, Corporation, Status)
VALUES
    (1978535095, "Ibn Khatab", 0, 263585335, "Active")