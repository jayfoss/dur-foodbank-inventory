# dur-foodbank-inventory
SE Project - Inventory management for County Durham Foodbank

# About County Durham Foodbank
- Part of network of 28 foodbanks
- 160 tonnes of food donated last year
- Helped 18.5k people in need around Durham area

# Key Points
- Require a stock management system
- No intake control so must allocate storage space dynamically, including relocating bulk items
- Rapid data collection for stock volume at any time and location: inform stock movement decisions
- Reconcilliation between donations received and orders from distribution centres fulfilled
- Aggregate all data into reports for management
- Must be able to review activity over time and provide activity/volume info to Trussel Trust
- Configurable for other foodbanks locally and nationally: adoptable by neighbouring foodbanks to share stock info
- Usability: diverse volunteer workforce
- Resilient: backup and restore functionality
- Offline: able to collect data without the requirement for WiFi at point of data entry
- Data validation
- Store data with date/time info
- Archive facility may be necessary
- Reports must be clear and unambiguous: highlight exceptions
- Essential reports: Quantity by category, Location Understock/Overstock warnings, Shortage lists to inform data collection points, usage rates by food category, order history/re-order predictions by distribution centre, search/query facility to drill into archived data useful for generating trend reports

# Git Branch Guidelines
- The **master** branch must be production-ready at all times
- The **develop** branch must branch from **master** and be used for working on new versions
- Individual named **feature** branches must be branched from **develop** to work on specific functionality. e.g. **feature-login-backend**. Once work has been completed on a feature, the **feature** branch must be merged into **develop**. The **feature** branch can be deleted without fast-forwarding so that the branch history shows on the graph.
- Versioned **release** branches must be branched from **develop** prior to release when the latest version is considered feature-complete. e.g. **release-1.0**. Once a **release** branch is created, no further features can be added to that version. Only bug fixes can be created on **release** branches. Bug fixes in **release** branches can be merged back into **develop**.
- Once a **release** branch is completed (i.e. we believe it is bug-free), it must be merged back into **master** for production release.
