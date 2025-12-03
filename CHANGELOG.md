# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)


## [1.1] - 2025-12-1

### Added

- Fullscreen mode
- Title screen
    - Toggle fullscreen button
- Pause screen
    - Toggle fullscreen button
- Architecture
    - Dependencies
        - Clouds.js v1.1.0

### Changed

- Architecture
    - Canvas now adapts to screen size
    - Ported all JavaScript to TypeScript
    - Added JavaScript minification to pipeline
    - Switched from static (and faulty) framerate to dynamic framerate with `requestAnimationFrame()`
    - Major refactoring
        - Removed a lot of code duplication and magic variables
        - Made dependencies between classes explicit
        - Improved decoupling
        - Improved coding style (more explicit variable names, usage of `const` and `let` instead of `var`, uniform conventions, etc.)
    - Exported [Clouds.js](https://github.com/Naccio/CloudsJS) as an independent module


## [1.0] - 2015-10

### Added

- Title screen
    - Tutorial button
    - Credits button
    - Toggle music button
- Pause screen
    - Toggle music button
- Tutorial
    - Explains core mechanics
    - Can be exited at any time
    - After being completed prompts to start a new game
- Credits screen
    - Shows credits
    - Back button
- Architecture
    - Touch events support

### Changed

- Big aesthetic overhaul
    - Embellished static screens
        - Improved layout
        - Added moving clouds in the background
    - Added background music
    - Created icons and visual cues for the upgrades
    - Minor color palette and UI improvements


## [0.2-beta] - 2015-06

### Added

- *Popularity* system
    - Uses the tracked statistics to calculate a single score
    - Influences game difficulty
- *Upgrades* system
    - Upgrades available after passing fixed thresholds of *Popularity*
    - 3 upgrades:
        - *Buy new datacenter*: Allows to add a new server, spawned randomly after choosing one of nine sections of the screen
        - *Improve speed at one location*: Allows to increase the rate at which a server elaborates its queue
        - *Scale off at one location*: Allows to increase a server's queue size
- Pause screen
    - Can be entered by pressing the space bar during a game
    - Allows to select an upgrade if its available
    - Can return to the game by pressing the space bar again
    - Abandon game button
    - Continue button
    - New game button
        

### Changed

- Game
    - Length increased to 5 minutes
    - Servers
        - Only one spawns at game start, in the central region
        - Renamed "Datacenters" in all UI
        - This changelog will keep calling them "servers" to avoid confusion
    - Clients
        - Spawn rate and number of requests scale also with the *Popularity*
    - Attackers
        - Frequency of attacks and number of attackers scale also with the *Popularity*
    - Statistics display shows only the *Popularity*
    - "Upgrade available" flashes on the screen when an upgrade is available
- Game over screen
    - Shows the *Popularity* after the statistics


### Fixed

- Bug that caused the servers from the previous game to be kept upon starting a new one


## [0.1-beta] - 2015

### Added

- Architecture
    - HTML canvas
        - Fixed 800x600 size
    - Pure JavaScript
        - OOP approach
    - No dependencies
- Title screen
    - Title
    - Start game button
- Game
    - 3 minutes length
    - Clients
        - Spawn randomly
        - Have random number of requests
        - Can be connected to a server by clicking on them and then on the server
        - Send requests at a fixed rate when they are connected to a server
        - De-spawn and count as *Successful connections* if they receive enough ACKs
        - De-spawn and count as *Dropped connections* if they receive too many NACKs
        - De-spawn and count as *Failed connections* if not connected within 10 seconds
        - Spawn rate increases throughout the game
    - Servers
        - 4 spawned in each quadrant at the beginning
        - Put requests in a queue when receiving them
        - If queue is not empty send out ACKs at a fixed rate
        - If queue is full send out NACKs when receiving new requests
    - Attackers
        - Simulate DDoS
        - Spawn after some time in a random number and automatically connect to a random server
        - Send requests at a fixed rate
        - Do not care about ACKs or NACKs, they want just to overload the server's queue
    - Statistics
        - Shown in bottom left corner
        - Successful connections
        - Dropped connections
        - Failed connections
        - Average response time
            - Time that passes from when a client sends out a request to when it receives an ACK
- Game over screen
    - Show statistics
    - New game button
    - Back to title button