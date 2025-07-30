-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`KORISNIK`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`KORISNIK` (
  `idKORISNIK` INT NOT NULL AUTO_INCREMENT,
  `Ime` VARCHAR(45) NULL,
  `Prezime` VARCHAR(45) NULL,
  `NazivAgencije` VARCHAR(45) NULL,
  `DatumRodjenja` DATE NULL,
  `KorisnickoIme` VARCHAR(45) NOT NULL,
  `Lozinka` TEXT NOT NULL,
  `TipKorisnika` TINYINT NOT NULL,
  `StatusNaloga` TINYINT NOT NULL,
  `Email` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`idKORISNIK`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`PONUDA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`PONUDA` (
  `idPONUDA` INT NOT NULL AUTO_INCREMENT,
  `Cijena` DECIMAL(6,2) NOT NULL,
  `Opis` VARCHAR(500) NOT NULL,
  `DatumObjavljivanja` DATETIME NOT NULL,
  `DatumPolaska` DATETIME NOT NULL,
  `DatumPovratka` DATETIME NOT NULL,
  `TipPrevoza` VARCHAR(45) NOT NULL,
  `BrojSlobodnihMjesta` INT NOT NULL,
  `NajatraktivnijaPonuda` TINYINT NOT NULL,
  `idKORISNIK` INT NOT NULL,
  `StatusPonude` TINYINT NOT NULL,
  PRIMARY KEY (`idPONUDA`),
  INDEX `fk_PONUDA_KORISNIK1_idx` (`idKORISNIK` ASC) VISIBLE,
  CONSTRAINT `fk_PONUDA_KORISNIK1`
    FOREIGN KEY (`idKORISNIK`)
    REFERENCES `mydb`.`KORISNIK` (`idKORISNIK`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`RECENZIJA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`RECENZIJA` (
  `idKORISNIK` INT NOT NULL,
  `idPONUDA` INT NOT NULL,
  `Komentar` VARCHAR(45) NOT NULL,
  `Ocjena` INT NOT NULL,
  `DatumIVrijeme` DATETIME NOT NULL,
  PRIMARY KEY (`idKORISNIK`, `idPONUDA`),
  INDEX `fk_RECENZIJA_PONUDA1_idx` (`idPONUDA` ASC) VISIBLE,
  INDEX `fk_RECENZIJA_KORISNIK1_idx` (`idKORISNIK` ASC) VISIBLE,
  CONSTRAINT `fk_RECENZIJA_PONUDA1`
    FOREIGN KEY (`idPONUDA`)
    REFERENCES `mydb`.`PONUDA` (`idPONUDA`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_RECENZIJA_KORISNIK1`
    FOREIGN KEY (`idKORISNIK`)
    REFERENCES `mydb`.`KORISNIK` (`idKORISNIK`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`ČET`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`ČET` (
  `idČET` INT NOT NULL AUTO_INCREMENT,
  `idKORISNIK1` INT NOT NULL,
  `idKORISNIK2` INT NOT NULL,
  PRIMARY KEY (`idČET`),
  INDEX `fk_ČET_KORISNIK1_idx` (`idKORISNIK1` ASC) VISIBLE,
  INDEX `fk_ČET_KORISNIK2_idx` (`idKORISNIK2` ASC) VISIBLE,
  CONSTRAINT `fk_ČET_KORISNIK1`
    FOREIGN KEY (`idKORISNIK1`)
    REFERENCES `mydb`.`KORISNIK` (`idKORISNIK`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ČET_KORISNIK2`
    FOREIGN KEY (`idKORISNIK2`)
    REFERENCES `mydb`.`KORISNIK` (`idKORISNIK`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`OBAVJEŠTENJE`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`OBAVJEŠTENJE` (
  `idOBAVJEŠTENJE` INT NOT NULL AUTO_INCREMENT,
  `Sadržaj` VARCHAR(45) NOT NULL,
  `DatumVrijeme` DATETIME NOT NULL,
  `Pročitano` TINYINT NOT NULL,
  `idKORISNIK` INT NOT NULL,
  PRIMARY KEY (`idOBAVJEŠTENJE`),
  INDEX `fk_OBAVJEŠTENJE_KORISNIK1_idx` (`idKORISNIK` ASC) VISIBLE,
  CONSTRAINT `fk_OBAVJEŠTENJE_KORISNIK1`
    FOREIGN KEY (`idKORISNIK`)
    REFERENCES `mydb`.`KORISNIK` (`idKORISNIK`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`PROBLEM`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`PROBLEM` (
  `idPROBLEM` INT NOT NULL AUTO_INCREMENT,
  `Naslov` VARCHAR(45) NOT NULL,
  `Sadržaj` VARCHAR(45) NOT NULL,
  `idKORISNIK` INT NOT NULL,
  PRIMARY KEY (`idPROBLEM`),
  INDEX `fk_PROBLEM_KORISNIK_idx` (`idKORISNIK` ASC) VISIBLE,
  CONSTRAINT `fk_PROBLEM_KORISNIK`
    FOREIGN KEY (`idKORISNIK`)
    REFERENCES `mydb`.`KORISNIK` (`idKORISNIK`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`PORUKA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`PORUKA` (
  `idPORUKA` INT NOT NULL AUTO_INCREMENT,
  `Sadržaj` VARCHAR(45) NOT NULL,
  `VrijemeSlanja` DATETIME NOT NULL,
  `Pročitano` TINYINT NOT NULL,
  `idČET` INT NOT NULL,
  PRIMARY KEY (`idPORUKA`),
  INDEX `fk_PORUKA_ČET1_idx` (`idČET` ASC) VISIBLE,
  CONSTRAINT `fk_PORUKA_ČET1`
    FOREIGN KEY (`idČET`)
    REFERENCES `mydb`.`ČET` (`idČET`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`REZERVACIJA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`REZERVACIJA` (
  `idREZERVACIJA` INT NOT NULL AUTO_INCREMENT,
  `Datum` DATETIME NOT NULL,
  `BrojOdraslih` INT NOT NULL,
  `BrojDjece` INT NOT NULL,
  `StatusRezervacije` TINYINT NOT NULL,
  `idPONUDA` INT NOT NULL,
  `idKORISNIK` INT NOT NULL,
  PRIMARY KEY (`idREZERVACIJA`),
  INDEX `fk_REZERVACIJA_PONUDA1_idx` (`idPONUDA` ASC) VISIBLE,
  INDEX `fk_REZERVACIJA_KORISNIK1_idx` (`idKORISNIK` ASC) VISIBLE,
  CONSTRAINT `fk_REZERVACIJA_PONUDA1`
    FOREIGN KEY (`idPONUDA`)
    REFERENCES `mydb`.`PONUDA` (`idPONUDA`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_REZERVACIJA_KORISNIK1`
    FOREIGN KEY (`idKORISNIK`)
    REFERENCES `mydb`.`KORISNIK` (`idKORISNIK`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`DESTINACIJA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`DESTINACIJA` (
  `idDESTINACIJA` INT NOT NULL AUTO_INCREMENT,
  `Naziv` VARCHAR(45) NOT NULL,
  `Opis` VARCHAR(150) NOT NULL,
  `Tip` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idDESTINACIJA`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`PONUDA_has_DESTINACIJA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`PONUDA_has_DESTINACIJA` (
  `idPONUDA` INT NOT NULL,
  `idDESTINACIJA` INT NOT NULL,
  PRIMARY KEY (`idPONUDA`, `idDESTINACIJA`),
  INDEX `fk_PONUDA_has_DESTINACIJA_DESTINACIJA1_idx` (`idDESTINACIJA` ASC) VISIBLE,
  INDEX `fk_PONUDA_has_DESTINACIJA_PONUDA1_idx` (`idPONUDA` ASC) VISIBLE,
  CONSTRAINT `fk_PONUDA_has_DESTINACIJA_PONUDA1`
    FOREIGN KEY (`idPONUDA`)
    REFERENCES `mydb`.`PONUDA` (`idPONUDA`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_PONUDA_has_DESTINACIJA_DESTINACIJA1`
    FOREIGN KEY (`idDESTINACIJA`)
    REFERENCES `mydb`.`DESTINACIJA` (`idDESTINACIJA`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
