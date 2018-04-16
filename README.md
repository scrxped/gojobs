# RGSC jobs search request structure

Property                      | Type      | Description
----------------------------- | --------- | -----------
`__RequestVerificationToken`  | `string`  | Token. Can be set via cookies
`onlyCount`                   | `boolean` | ?
`offset`                      | `integer` | Offset
`SearchOptType`               | `integer` | Job type
`SearchOptSubType`            | `string`  | Job subtype
`SearchOptPublisher`          | `string`  | Publisher
`SearchOptDate`               | `string`  | Date in a special format
`SearchOptNamed`              | `string`  | Author nickname
`SearchOptSort`               | `string`  | Sort type
`SearchOptPlayers`            | `integer` | Number of players a job fits (1..30 or empty)
`SearchText`                  | `string`  | Search text
`Locations`                   | `array<Location>`   |
`Vehicles`                    | `array<Vehicle>`   |
`Weapons`                     | `array<Weapon>`   |

## Job Types IDs (`SearchOptType`)
Value     | Description
--------- | -----------
`<empty>` | Any type
`0`       | Mission
`1`       | Deathmatch
`2`       | Race
`3`       | Survival
`4`       | Capture
`7`       | Last team standing
`8`       | Parachuting

## Job Subtypes (`SearchOptSubType`)
Type | Job type ID | Description
---- | ----------- | -----------
`<empty>`           |     | Any
`versus`            | `0` | Versus Mission
`adversary`         | `0` | Adversary Mode
`deathmatch`        | `1` | Regular Deathmatch
`teamdeathmatch`    | `1` | Team Deathmatch
`vehicledeathmatch` | `1` | Vehicle Deathmatch
`specialrace`       | `2` | Special Vehicle Race
`stuntrace`         | `2` | Stunt Race
`airrace`           | `2` | Air Race
`bikerace`          | `2` | Bike Race
`landrace`          | `2` | Land Race
`waterrace`         | `2` | Water Race
`transformrace`     | `2` | Transform Race
`targetrace`        | `2` | Target Assault Race

## Publisher (`SearchOptPublisher`)
Type | Description
---- | -----------
`<empty>`       | Any
`bookmarked`    | Bookmarked jobs
`me`            | Jobs by authorized user
`friends`       | Friends' jobs
`rockstar`      | Rockstar jobs
`rstarverified` | Rockstar Verified jobs
`members`       | Social Club members jobs
`crewXXXXXX`    | Jobs by a crew with id XXXXXX

## Date (`SearchOptDate`)
Type | Description
---- | -----------
`<empty>`   | Any
`today`     | Today's jobs
`last7`     | Last 7 days' jobs
`lastMonth` | Last month's jobs

## Sort (`SearchOptSort`)
Type | Description
---- | -----------
`CreatedDate` | Sort by date of creation
`Liked`       | Sort by number of likes
`Name`        | Sort by name
`Played`      | Sort by plays
`Relevance`   | Sort by relevance (questionable option)

# RGSC jobs list JSON structure

## Flags
* `x` - can only be retrieved from e**x**tended job object
* `u` - can be `undefined`
* `e` - can be empty
* `!` - can be incorrect OR needs some transformation for further use OR even meaning isn't known properly

## Special types
Type | Actual type | Description
---- | ----------- | -----------
`MissionId` | `string` | String that pepresents job ID

## Root properties

Property | Type | Flags | Description
-------- | ---- | ----- | -----------
`MissionId` | `MissionId` | | Unique job ID (**NOT** a current ID!)
`Players`   | `array`     | `!` | (?) Always empty array

## `Content.stats`

Property | Type | Flags | Description
-------- | ---- | ----- | -----------
`pt` | `integer` | `u` | Played total
`pu` | `integer` | `u` | Played unique
`qt` | `integer` | `u` | Quit total 
`qu` | `integer` | `u` | Quit unique
`dt` | `integer` | `!u`| (?) Always 0
`du` | `integer` | `!u`| (?) Always 0

## `Content.ratings`

Property | Type | Flags | Description
-------- | ---- | ----- | -----------
`rt_pos`     | `integer` | `u`  | Likes
`rt_neg`     | `integer` | `u`  | Dislikes (actual dislikes + `Content.stats.qu`)
`rt_unq`     | `integer` | `u`  | `rt_pos` + `rt_neg`
`rt_pos_pct` | `float`   | `u`  | % of `rt_pos`
`rt_neg_pct` | `float`   | `u`  | % of `rt_neg`
`bkmk_unq`   | `integer` | `u`  | People bokmarked this (DON'T USE IT - absolutely incorrect)
`avg`        | `string`  | `!u` | `rt_pos_pct` + '%'
`rt_avg`     | `float`   | `!u` | 99,99% alias of `rt_pos_pct`
`rt_tot`     | `integer` | `!u` | Always 0?

## `Content.Metadata`

Property | Type | Flags | Description
-------- | ---- | ----- | -----------
`_id`                     | `MissionId` | | `MissionId` **ALIAS**
`RootContentId`           | `MissionId` | | Actual (**CURRENT**) job ID - **differs** from `_id`, changes every new version
`cat`                     | `string`    | | Category: `none`, `rstar`, `verif`
`cdate`                   | `date`      | | Update date
`pdate`                   | `date`      | | Update date (alias)
`name`                    | `string`    | | Name
`desc`                    | `string`    | | Description
`nickname`                | `string`    | | Author nickname
`avatar`                  | `string`    | | `n/lowecased_nickname` or a link to the default avatar
`rockstarId`              | `integer`   | `e` | User ID
`creatorMedal`            | `string`    | `u` | "Medals": `white`, `bronze`, `silver`, `gold`, `platinum`
`crewurl`                 | `string `   | `u` | `/crew/<crew_name>` 
`crewtag`                 | `string`    | `u` | Crew tag (not always uppercased)
`crewrank`                | `integer`   |     | Crew within the crew from `1` to `4`, `0` if no crew
`crewcolor`               | `string`    | `u` | Color in `#rrggbb` or `#rrggbbaa` format
`isfoundercrew`           | `boolean`   |     | If founder of the crew?
`isprivate`               | `boolean`   |     | If crew is private, `false` also means no crew
`thumbnail`               | `string`    |     | `https://prod.cloud.rockstargames.com/ugc/gta5mission/<unique number>/<ID>/<1, 2 or 3>_0.jpg`
`plat`                    | `string`    |     | `Ps3`, `Ps4`, `XBox`, `XBoxOne`, `PC` (NOTE: even rockstar jobs have this property!)
`tags`                    | `Array<string>` | `e` | Array of tags
`ver`                     | `integer`   |      | Job version
`url`                     | `string`    |      | `/games/gtav/jobs/job/<MissionId>`
`latestVersionContentId`  | `MissionId` |      | Alias of `MissionId`
`copiedFrom`              | `MissionId` | `u`  | Original job ID (relevant only for rockstar verified jobs)
`originalCreatorId`       | `integer`   | `x`  | (only for R* verified) `rockstarId`
`originalCreatorName`     | `string`    | `x`  | (only for R* verified) `nickname`
`latest`                  | `boolean`   | `!`  | Always `true` ?
`isOwner`                 | `boolean`   | `!`  | Always `false`?
`bkmr`                    | `boolean`   | `!`  | Always `false`?
`subscribed`              | `boolean`   | `!`  | Always `false`?
`cansubscribe`            | `boolean`   | `!`  | Always `false`?

## `Content.Metadata.data.mission.gen`

Property | Type | Flags | Description
-------- | ---- | ----- | -----------
`type`      | `string`  |     | Job type (see possible values below)
`min`       | `integer` |     | Min players
`num`       | `integer` |     | Max players
`start`     | `object`  |     | Trigger's pos (`x`, `y`, `z` - `float`s)
`subtype`   | `integer` |     | Mode **ID** (see below)
`tnum`      | `integer` |     | Max number of teams (`1` - `4`)
`icon`      | `string`  |     | Mode **icon** (see below)
`mode`      | `string`  |     | Mode **full name** (see below)
`ivm`       | `integer` |     | ID of a default vehicle set by job author OR a number from `0` to `15` for races, `0` for DMs & Parachuting, `-1` else
`adverm`    | `integer` | `e` | ID of the adversary mode, `0` if not an AM
`racetype`  | `string`  | `u` | (only for races) `Laps`, `Point To Point`
`rank`      | `integer` | `!` | Min rank to play a job
`char`      | `integer` | `!` | Always 0?
`endtype`   | `integer` | `!` | `0`, `2`-`5` for Versus Mission, LTS, AM, Capture IF rockstar, else for Captures ONLY (see stats below) (?) | -
`mtnum`     | `integer` | `!` | `1` or `2` (?)
`rad`       | `integer` | `!` | Always 0?
`photo`     | `boolean` | `!` | Rarely `true` (?)

## `Content.Metadata.data.mission.race`

For races only.

Property | Type | Flags | Description
-------- | ---- | ----- | -----------
`type`     | `string`         |      | Race type (see below)
`chp`      | `integer`        |      | Number of checkpoints
`lap`      | `integer`        |      | Default number of laps (`0` if P2P)
`rdis`     | `float`          |      | Distance in metres
`aveh`     | `array<string>`  | `xu` | Available vehicle classes (undefined if target assault race)
`chl`      | `array<object>`  | `x`  | Checkpoint locations
`sndchk`   | `array<object>`  | `xu` | Sec. checkpoint locations (`(0, 0)` if no corresponding secondary checkpoint)
`cptfrm`   | `array<integer>` | `x` | (only for tr. races) `-1` if no transformation on current CP, else means transform vehicle ID (basically these IDs are `trfmvmn` array indexes)
`trfmvmn`  | `array<string>`  | `x` | List of vehicles available for transformation in. `0` usually `Base vehicle`. Not all of them may be used in the race, check `cptfrm` property
`subtype`  | `integer`        | `!`  | (?) `20` - tr. race, `21` - special vehicle race
`aveh`     | `array<string>`  | `!`  | Vehicle classes (no info (empty array) in most cases)
`dist`     | `string`         | `!`  | Formatted distance like `10.01 miles` (DON'T use it)
`gw`       | `integer`        | `!`  | (?) Sometimes values like `4.5`, `6.75`, otherwise `0`
`ivm`      | `integer`        | `!`  | (?) Always 0
`clbs`     | `integer`        | `!`  | (?) Some number...

## `Content.Metadata.data.mission.rule`

Property | Type | Flags | Description
-------- | ---- | ----- | -----------
`liv`      | `integer` | `!` | (?) Always 0
`pol`      | `integer` | `!` | (?) `0`-`5` (police?)
`score`    | `integer` | `!` | (?) Up to `19` for DM, `0` otherwise
`tdm`      | `integer` | `!` | (?) `1` if Team DM & other cases `0` otherwise
`time`     | `integer` | `!` | (?) `1`-`6` only for DM
`tod`      | `integer` | `!` | (?) `0`-`4` (time of day?: `0` - current, `1` - morning, `2` - night)
`traf`     | `integer` | `!` | (?) `0`-`5` (traffic?: `0` - default, `1` - off, `2` - low)
`vdm`      | `integer` | `!` | (?) `1` if Vehicle DM, `0` otherwise

## (extended object) `Content.Metadata.data.mission.weap`

Property | Type | Flags | Description
-------- | ---- | ----- | -----------
`sub`  | `array<string>` | | "Weapons" on the map: `BOOST`, `ROCKET` (don't use it)
`loc`  | `array<object>` | | Weapons locations `{x: float, y: float}`
`type` | `array<object>` | | Actual names of the weapons: `Vehicle - Powerups`, `Vehicle - Health`, `Vehicle - Molotov` (races), e.g. `Sniper Rifle`, `Armor`, `Heavy Revolver` for DMs, ...

## (extended object) `Content.Metadata.data.mission.ene`

`array<Location(x, y)>` - ??

## (extended object) `Content.Metadata.data.mission.(d)props, .veh, .obj`

`(d)props` - rRegular & dynamic props\
`veh` - initial spawn points for vehicles\
`obj` - ??

Property | Type | Flags | Description
-------- | ---- | ----- | -----------
`loc`   | `array<object>` | | Props (vehicles) locations `{x: float, y: float}`
`model` | `array<object>` | | Names, e.g. `Medium Ramp`, `	Large Closed Container`, `Barrel Line`, `Water Machine`,...

## `Content.Metadata.data.meta`

Property | Type | Flags | Description
-------- | ---- | ----- | -----------
`vehcl` | `array<string>`   |      | (only for races) excluded vehicle classes for races **(use this!)**
`veh`   | `array<integer>`  | `u`  | Vehicles used in a job
`wp`    | `array<integer>`  | `u`  | Weapons used in a job if applicable
`loc`   | `array<string>`   | `u`  | Locations (short names) (see below)
`locn`   | `array<string>`  | `x`  | Locations (full names) (see below)
`ems`   | `boolean`         | `!`  | (?) `true` for some LTS, Capture, Versus, ADM
`mrule` | `array<integer>`  | `!u` | (?) Array like `0,2,11` only for Capture, LTS, Versus

# Types, modes, locations, vehicles, weapons, vehicle classes

## Types (`Content.Metadata.data.mission.gen.type`)

`Race`\
`FreeMission`\
`Deathmatch`\
`Parachuting`\
`Survival`

## Modes

Official name = `Content.Metadata.data.mission.gen.name`\
ID = `Content.Metadata.data.mission.gen.subtype`

If an item has two IDs, the second one means `P2P` mode (looks like).

Official name | ID | Type | Icon name
------------- | -- | ---- | ---------
`Survival`             | 0 | `Survival`    | `Survival`
`Deathmatch`           | 0 | `Deathmatch`  | `Deathmatch`
`Team Deathmatch`      | 1 | `Deathmatch`  | `TeamDeathmatch`
`Vehicle Deathmatch`   | 2 | `Deathmatch`  | `VehicleDeathmatch`
`Versus Mission`       | 4 | `FreeMission` | `VersusMission`
`Adversary Mode`       | 4 | `FreeMission` | `VersusMission` (?)
`Last Team Standing`   | 5 | `FreeMission` | `LastTeamStanding`
`Capture`              | 6 | `FreeMission` | `Capture`
`Parachuting`          | 8 | `Parachuting` | `Parachuting`
`Land Race`            | 0, 1   | `Race` | `LandRace`, `LandRaceP2P`
`Water Race`           | 2, 3   | `Race` | `WaterRace`, `WaterRaceP2P`
`Air Race`             | 4, 5   | `Race` | `AirRace`, `AirRaceP2P`
`Stunt Race`           | 6, 7   | `Race` | `StuntRace`, `StuntRaceP2P`
`Special Vehicle Race` | 6, 7   | `Race` | `StuntRace`, `StuntRaceP2P` (?)
`Transform Race`       | 6, 7   | `Race` | `StuntRace`, `StuntRaceP2P` (?)
`Bike Race`            | 13     | `Race` | `BikeRace`, `BikeRaceP2P`
`Target Assault Race`  | 18, 19 | `Race` | `StuntRace`, `StuntRaceP2P` (?)

## Race types (`Content.Metadata.data.mission.race.type`)

`STANDARD`\
`P2P`\
`AIR`\
`BOAT`\
`TRIATHLON`\
`TRIATHLON_P2P`\  
`AIR_P2P`\
`P2PBASEJUMP`\
`BIKE_AND_CYCLE_P2P`\
`BIKE_AND_CYCLE`\
`BOAT_P2P`\
`TARGET`

## Locations

Location | Short name
-------- | ----------
Alamo Sea                         | `Alamo`
Alta                              | `Alta`
Banham Canyon                     | `BhamCa`
Banning                           | `Banning`
Baytree Canyon                    | `Baytre`
Bolingbroke Penitentiary          | `Jail`
Braddock Pass                     | `BradP`
Braddock Tunnel                   | `BradT`
Burton                            | `Burton`
Calafia Bridge                    | `CalafB`
Cassidy Creek                     | `CCreak`
Chamberlain Hills                 | `ChamH`
Chiliad Mountain State Wilderness | `CMSW`
Chumash                           | `CHU`
Countryside                       | `COSI`
Cypress Flats                     | `Cypre`
Davis                             | `Davis`
Davis Quartz                      | `zQ_UAR`
Del Perro                         | `DelPe`
Del Perro Beach                   | `DelBe`
Downtown                          | `Downt`
Downtown Vinewood                 | `DTVine`
East Los Santos                   | `ELSant`
East Vinewood                     | `East_V`
Eclipse                           | `Eclips`
El Burro Heights                  | `EBuro`
El Gordo Lighthouse               | `ELGorl`
Elysian Island                    | `Elysian`
Fort Zancudo                      | `ArmyB`
Galilee                           | `Galfish`
Galileo Observatory               | `Observ`
Galileo Park                      | `Galli`
Grand Senora Desert               | `Desrt`
Grapeseed                         | `GrapeS`
Great Chaparral                   | `Greatc`
GWC and Golfing Society           | `Golf`
Harmony                           | `Harmo`
Hawick                            | `Hawick`
Heart Attacks Beach               | `Heart`
Humane Labs and Research          | `HumLab`
La Mesa                           | `LMesa`
La Puerta                         | `DelSol`
La Puerta Fwy                     | `LosPFy`
Lago Zancudo                      | `Lago`
Land Act Dam                      | `LDam`
Land Act Reservoir                | `LAct`
Legion Square                     | `LegSqu`
Little Seoul                      | `Koreat`
Los Santos Freeway                | `LosSF`
Los Santos International Airport  | `Airp`
Lost MC                           | `LOSTMC`
Maze Bank Arena                   | `Stad`
Mirror Park                       | `Mirr`
Mission Row                       | `SKID`
Morningwood                       | `Morn`
Mount Chiliad                     | `MTChil`
Mount Gordo                       | `MTGordo`
Mount Josiah                      | `MTJose`
Murrieta Heights                  | `Murri`
N.O.O.S.E                         | `Noose`
North Chumash                     | `NCHU`
Pacific Bluffs                    | `PBluff`
Pacific Ocean                     | `Oceana`
Paleto Bay                        | `Paleto`
Paleto Cove                       | `PalCov`
Paleto Forest                     | `PalFor`
Palmer-Taylor Power Station       | `Palmpow`
Palomino Highlands                | `PalHigh`
Pillbox Hill                      | `PBOX`
Port of South Los Santos          | `ZP_ORT`
Procopio Beach                    | `ProcoB`
Rancho                            | `Rancho`
Raton Canyon                      | `CANNY`
Redwood Lights Track              | `RTRAK`
Richards Majestic                 | `Movie`
Richman                           | `Richm`
Richman Glen                      | `RGLEN`
Rockford Hills                    | `Rockf`
Ron Alternates Wind Farm          | `WindF`
San Andreas                       | `SanAnd`
San Chianski Mountain Range       | `SanChia`
Sandy Shores                      | `SANDY`
Senora Freeway                    | `Zenora`
South Los Santos                  | `SLSant`
Stab City                         | `Slab`
Strawberry                        | `STRAW`
Tataviam Mountains                | `Tatamo`
Terminal                          | `Termina`
Textile City                      | `TEXTI`
Tongva Hills                      | `TongvaH`
Tongva Valley                     | `TongvaV`
Utopia Gardens                    | `UtopiaG`
Venice                            | `zV_NCE`
Vernon                            | `zV_NON`
Vespucci                          | `Vesp`
Vespucci Beach                    | `Beach`
Vespucci Canals                   | `VCana`
Vinewood                          | `Vine`
Vinewood Hills                    | `CHIL`
Vinewood Racetrack                | `HORS`
W Mirror Drive                    | `WMirror`
West Vinewood                     | `WVine`
Zancudo River                     | `Zancudo`

## Vehicles

See `vehicles.json`.

## Pickups

See `pickups.json`.

## Vehicle classes

ID | Official name
-- | -------------
`1`  | `Bikes` or `Heli` or `Boats`
`2`  | `Classics` or `Plane`
`3`  | `Compacts`
`4`  | `Coupes`
`5`  | `Cycles`
`6`  | `Industrial`
`7`  | `Mucle` (yes, this is a R* error!)
`8`  | `OffRoad`
`9`  | `Sedans`
`10`  | `Special`
`11`  | `Sports`
`12`  | `Super`
`13`  | `SUV`
`14`  | `Utility`
`15`  | `Vans`
