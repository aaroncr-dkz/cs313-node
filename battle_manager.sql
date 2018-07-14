--
-- Table structure for table `alignments`
--

CREATE TABLE alignments (
  alignmentId 	SERIAL 		PRIMARY KEY,
  alignmentName varchar(15) NOT NULL
);

--
-- Dumping data for table `alignments`
--

INSERT INTO alignments (alignmentId, alignmentName) VALUES
(1, 'lawful good'),
(2, 'lawful neutral'),
(3, 'lawful evil'),
(4, 'neutral good'),
(5, 'neutral'),
(6, 'neutral evil'),
(7, 'chaotic good'),
(8, 'chaotic neutral'),
(9, 'chaotic evil'),
(10, 'unaligned');

-- --------------------------------------------------------

--
-- Table structure for table `attacks`
--

CREATE TABLE attacks (
  atkId 	 SERIAL 		PRIMARY KEY,
  name 		 varchar(15)	NOT NULL,
  type 		 varchar(15) 	NOT NULL,
  atkBonus 	 int 			NOT NULL,
  reach 	 int 			NOT NULL,
  dmgDieNum  int 			NOT NULL,
  dmgDieSize int 			NOT NULL,
  dmgBonus 	 int 			NOT NULL,
  dmgTypeId  int 			REFERENCES damagetypes(dmgTypeId) 	NOT NULL
);

--
-- Dumping data for table `attacks`
--

INSERT INTO attacks (atkId, name, type, atkBonus, reach, dmgDieNum, dmgDieSize, dmgBonus, dmgTypeId) VALUES
(2, 'Beak', 'Melee Weapon', 6, 5, 1, 8, 4, 1),
(3, 'Claw', 'Melee Weapon', 6, 5, 2, 6, 4, 2),
(4, 'Slam', 'Melee Weapon', 4, 5, 1, 6, 2, 3),
(5, 'Claw', 'Melee Weapon', 5, 5, 1, 6, 3, 2),
(6, 'Slam', 'Melee Weapon', 8, 5, 2, 8, 5, 3),
(7, 'Longsword', 'Melee Weapon', 6, 5, 1, 8, 4, 2),
(8, 'Slam', 'Melee Weapon', 7, 5, 2, 8, 4, 3),
(9, 'Slam', 'Melee Weapon', 8, 10, 2, 8, 5, 3),
(10, 'Bite', 'Melee Weapon', 4, 5, 1, 6, 2, 1),
(11, 'Claw', 'Melee Weapon', 4, 5, 1, 6, 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `classifications`
--

CREATE TABLE classifications (
  classificationId 		SERIAL 		PRIMARY KEY,
  classificationName 	varchar(15)	NOT NULL
);

--
-- Dumping data for table `classifications`
--

INSERT INTO classifications (classificationId, classificationName) VALUES
(1, 'abberation'),
(2, 'beast'),
(3, 'celestial'),
(4, 'construct'),
(5, 'dragon'),
(6, 'elemental'),
(7, 'fey'),
(8, 'fiend'),
(9, 'giant'),
(10, 'humanoid'),
(11, 'monstrosity'),
(12, 'ooze'),
(13, 'undead');

-- --------------------------------------------------------

--
-- Table structure for table `creatures`
--

CREATE TABLE creatures (
  id 				SERIAL 		PRIMARY KEY,
  name 				varchar(30)	NOT NULL,
  size 				varchar(10)	NOT NULL,
  classificationId 	INT 		REFERENCES classifications(classificationId)	NOT NULL,
  alignmentId 		INT 		REFERENCES alignments(alignmentId)				NOT NULL,
  ac 				INT 		NOT NULL,
  hp 				INT 		NOT NULL,
  speed 			varchar(30)	NOT NULL,
  cr 				INT 		NOT NULL,
  dex 				INT 		NOT NULL,
  specials 			INT 		NOT NULL
);

--
-- Dumping data for table `creatures`
--

INSERT INTO creatures (id, name, size, classificationId, alignmentId, ac, hp, speed, cr, dex) VALUES
(1, 'Griffon', 'Large', 11, 10, 12, 59, '30 ft., fly 80 ft.', 2, 15),
(2, 'Nothic', 'Medium', 1, 6, 15, 45, '30 ft.', 2, 16),
(3, 'Animated Armor', 'Medium', 4, 10, 18, 33, '30 ft.', 1, 11),
(4, 'Helmed Horror', 'Medium', 4, 5, 20, 60, '30 ft., fly 30 ft.', 4, 13),
(5, 'Air Elemental', 'Large', 6, 5, 15, 90, '0 ft., fly 90 ft. (hover)', 5, 20),
(6, 'Water Elemental', 'Large', 6, 5, 14, 114, '30 ft., swim 90 ft.', 5, 14),
(7, 'Earth Elemental', 'Large', 6, 5, 17, 126, '30 ft., burrow 30 ft.', 5, 8),
(8, 'Gargoyle', 'Medium', 6, 9, 15, 52, '30 ft., fly 60 ft.', 2, 11);

-- --------------------------------------------------------

--
-- Table structure for table `creature_attacks`
--

CREATE TABLE creature_attacks (
  creatureId 	int 	REFERENCES creatures(id) NOT NULL,
  atkId 		int 	REFERENCES attacks(atkId) NOT NULL,
  freq 			int   	NOT NULL
);

--
-- Dumping data for table `creature_attacks`
--

INSERT INTO creature_attacks (creatureId, atkId, freq) VALUES
(1, 2, 1),
(1, 3, 1),
(2, 5, 2),
(3, 4, 2),
(5, 6, 2),
(6, 8, 2),
(7, 9, 2),
(8, 10, 1),
(8, 11, 1);

-- --------------------------------------------------------

--
-- Table structure for table `creature_specials`
--

CREATE TABLE creature_specials (
  creatureId int  REFERENCES creatures(id) NOT NULL,
  specAtkId int  REFERENCES specialattacks(specAtkId) NOT NULL
);

--
-- Dumping data for table `creature_specials`
--

INSERT INTO creature_specials (creatureId, specAtkId) VALUES
(2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `damagetypes`
--

CREATE TABLE damagetypes (
  dmgTypeId 	SERIAL 		PRIMARY KEY,
  dmgTypeName 	varchar(12)	NOT NULL
);

--
-- Dumping data for table `damagetypes`
--

INSERT INTO damagetypes (dmgTypeId, dmgTypeName) VALUES
(1, 'piercing'),
(2, 'slashing'),
(3, 'bludgeoning'),
(4, 'fire'),
(5, 'cold'),
(6, 'lightning'),
(7, 'poison'),
(8, 'acid'),
(9, 'thunder'),
(10, 'force'),
(11, 'psychic'),
(12, 'radiant'),
(13, 'necrotic');

-- --------------------------------------------------------

--
-- Table structure for table `specialattacks`
--

CREATE TABLE specialattacks (
  specAtkId 	SERIAL 		PRIMARY KEY,
  name 			varchar(30) NOT NULL,
  description 	text 		NOT NULL,
  dc 			int 		NOT NULL,
  save          char(3) 	NOT NULL,
  saveResult 	varchar(15) NOT NULL,
  recharge 		int 		NOT NULL,
  dmgDieNum 	int 		NOT NULL,
  dmgDieSize 	int 		NOT NULL,
  dmgTypeId 	int REFERENCES damagetypes(dmgTypeId) NOT NULL
);

--
-- Dumping data for table `specialattacks`
--

INSERT INTO specialattacks (specAtkId, name, description, dc, save, saveResult, recharge, dmgDieNum, dmgDieSize, dmgTypeId) VALUES
(1, 'Rotting Gaze', 'The nothic targets one creature it can see within 30 feet of it. The target must succeed on a DC 12 Constitution saving throw against this magic or take 10 (3d6) necrotic damage', 12, 'CON', 'No Effect', 0, 3, '6', 13);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attacks`
--
ALTER TABLE `attacks`
  ADD PRIMARY KEY (`atkId`),
  ADD KEY `fk_dmgTypeId` (`dmgTypeId`);

--
-- Indexes for table `classifications`
--
ALTER TABLE `classifications`
  ADD PRIMARY KEY (`classificationId`);

--
-- Indexes for table `creatures`
--
ALTER TABLE `creatures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_alignmentId` (`alignmentId`),
  ADD KEY `fk_classificationId` (`classificationId`);

--
-- Indexes for table `creature_attacks`
--
ALTER TABLE `creature_attacks`
  ADD PRIMARY KEY (`creatureId`,`atkId`),
  ADD KEY `fk_atkId` (`atkId`);

--
-- Indexes for table `creature_specials`
--
ALTER TABLE `creature_specials`
  ADD PRIMARY KEY (`creatureId`,`specAtkId`),
  ADD KEY `fk_specAtkId` (`specAtkId`);

--
-- Indexes for table `damagetypes`
--
ALTER TABLE `damagetypes`
  ADD PRIMARY KEY (`dmgTypeId`);

--
-- Indexes for table `specialattacks`
--
ALTER TABLE `specialattacks`
  ADD PRIMARY KEY (`specAtkId`),
  ADD KEY `fk_dmgTypeId_specials` (`dmgTypeId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alignments`
--
ALTER TABLE `alignments`
  MODIFY `alignmentId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `attacks`
--
ALTER TABLE `attacks`
  MODIFY `atkId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `classifications`
--
ALTER TABLE `classifications`
  MODIFY `classificationId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
--
-- AUTO_INCREMENT for table `creatures`
--
ALTER TABLE `creatures`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `damagetypes`
--
ALTER TABLE `damagetypes`
  MODIFY `dmgTypeId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
--
-- AUTO_INCREMENT for table `specialattacks`
--
ALTER TABLE `specialattacks`
  MODIFY `specAtkId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `attacks`
--
ALTER TABLE `attacks`
  ADD CONSTRAINT `fk_dmgTypeId` FOREIGN KEY (`dmgTypeId`) REFERENCES `damagetypes` (`dmgTypeId`);

--
-- Constraints for table `creatures`
--
ALTER TABLE `creatures`
  ADD CONSTRAINT `fk_alignmentId` FOREIGN KEY (`alignmentId`) REFERENCES `alignments` (`alignmentId`),
  ADD CONSTRAINT `fk_classificationId` FOREIGN KEY (`classificationId`) REFERENCES `classifications` (`classificationId`);

--
-- Constraints for table `creature_attacks`
--
ALTER TABLE `creature_attacks`
  ADD CONSTRAINT `fk_atkId` FOREIGN KEY (`atkId`) REFERENCES `attacks` (`atkId`),
  ADD CONSTRAINT `fk_creatureId` FOREIGN KEY (`creatureId`) REFERENCES `creatures` (`id`);

--
-- Constraints for table `creature_specials`
--
ALTER TABLE `creature_specials`
  ADD CONSTRAINT `fk_creatureId_specials` FOREIGN KEY (`creatureId`) REFERENCES `creatures` (`id`),
  ADD CONSTRAINT `fk_specAtkId` FOREIGN KEY (`specAtkId`) REFERENCES `specialattacks` (`specAtkId`);

--
-- Constraints for table `specialattacks`
--
ALTER TABLE `specialattacks`
  ADD CONSTRAINT `fk_dmgTypeId_specials` FOREIGN KEY (`dmgTypeId`) REFERENCES `damagetypes` (`dmgTypeId`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
