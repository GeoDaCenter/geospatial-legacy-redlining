## ----setup, include=FALSE, eval = FALSE--------------------------------------------------------------------------------------------------------------------
## knitr::opts_chunk$set(echo = TRUE)
## library(tidyverse)
## library(sf)


## ---- eval = FALSE-----------------------------------------------------------------------------------------------------------------------------------------
## # read in sundown town areas
## sundown_areas <- st_read("C:/Users/isaac/Desktop/HEROP/sundown towns cleaning/data/sundown_towns_areas_simplified.geojson")
## sundown_areas <- sundown_areas %>% st_transform(5069)
## 
## # Read in 2020 tract boundaries
## us_tracts <- st_read("C:/Users/isaac/Desktop/HEROP/identifying sundown tracts/data/nhgis0012_shape/nhgis0012_shape/nhgis0012_shapefile_tl2020_us_tract_2020/US_tract_2020.shp")
## 
## 
## # restricts us tracts to those which intersect a sundown area
## # makes a row for each tract-sundown town overlap
## #     e.g. some tracts are in both sundown towns at the city level and at the county level, there will be one row for the overlap between tract and city and one for the overlap between tract and county
## us_tracts <- us_tracts %>%
##   st_transform(5069) %>%
##   st_join(sundown_areas, left = FALSE)
## 
## # read in block group data (used for population overlap)
## # data originally sourced from 2020 Census via NHGIS
## us_block_groups <- st_read("C:/Users/isaac/Desktop/HEROP/identifying sundown tracts/data/nhgis0014_shape/nhgis0014_shape/nhgis0014_shapefile_tl2020_us_blck_grp_2020/US_blck_grp_2020.shp")
## us_block_groups <- us_block_groups %>%
##   select(c(GISJOIN, STATEFP, COUNTYFP, TRACTCE, BLKGRPCE, GEOID))
## us_block_groups_pop <- read.csv("C:/Users/isaac/Desktop/HEROP/identifying sundown tracts/data/nhgis0013_csv/nhgis0013_csv/nhgis0013_ds248_2020_blck_grp.csv")
## us_block_groups_pop <- us_block_groups_pop %>%
##   select(c(U7B001, GISJOIN))
## 
## # clean up the block group data a bit, join shapes with population info
## us_block_groups <- us_block_groups %>%
##   left_join(us_block_groups_pop) %>%
##   st_transform(5069) %>%
##   st_join(sundown_areas, left = TRUE) %>%
##   select(c(GISJOIN, STATEFP, COUNTYFP, TRACTCE, BLKGRPCE, GEOID, U7B001))
## 


## ---- eval = FALSE-----------------------------------------------------------------------------------------------------------------------------------------
## 
## pb <- txtProgressBar(min = 0,      # Minimum value of the progress bar
##                      max = nrow(us_tracts), # Maximum value of the progress bar
##                      style = 3,    # Progress bar style (also available style = 1 and style = 2)
##                      width = 50,   # Progress bar width. Defaults to getOption("width")
##                      char = "=")   # Character used to create the bar
## 
## # intialize all values to NA, if any remain at the end, something went wrong
## us_tracts$percent_sundown <- NA
## # nb: this loop takes like an hour and a half
## for(i in 1:nrow(us_tracts)){
##   # store current tract
##   tract <- us_tracts[i,]
##   # store current sundown area which the tract overlaps with
##   sundown_area <- sundown_areas[sundown_areas$full_name == tract$full_name, ]
##   # store the shape of the overlap between the tract and the sundwon area
##   overlap <- st_intersection(tract, sundown_area)
## 
##   tryCatch({
##     # calculate proportion of total tract area which is in the sundown town
##     us_tracts[i,]$percent_sundown <- st_area(overlap)/st_area(tract)
##   },error = function(e){
##     # in the event that this errors, it is most likely because the tract and sundown town shared no overlapping area (so we tried to divide null by zero and R complained)
##     # this most often happens when a sundown town and a tract share a border, but no actual area
##     print(paste("trouble with tract ", tract$GISJOIN, " may not actually overlap town ", sundown_area$full_name))
##     us_tracts[i, ]$percent_sundown <- NA
##   })
##   setTxtProgressBar(pb, i)
## }
## close(pb)


## ---- eval = FALSE-----------------------------------------------------------------------------------------------------------------------------------------
## us_tracts <- us_tracts %>%
##   select(c(GISJOIN, STATEFP, COUNTYFP, TRACTCE, GEOID, NAME, place_type, full_name, type, confirmed, sign, ordinance, showcase, orig_long, orig_lat, name, state, id, relocated_while_cleaning, percent_sundown))


## ---- eval = FALSE-----------------------------------------------------------------------------------------------------------------------------------------
## 
## 
## pb <- txtProgressBar(min = 0,      # Minimum value of the progress bar
##                      max = nrow(us_tracts), # Maximum value of the progress bar
##                      style = 3,    # Progress bar style (also available style = 1 and style = 2)
##                      width = 50,   # Progress bar width. Defaults to getOption("width")
##                      char = "=")   # Character used to create the bar
## 
## 
## # intialize all values to NA, if any remain at the end, something went wrong
## us_tracts$population_sundown <- NA
## # nb: this loop takes a couple hours
## for(i in 1:nrow(us_tracts)){
##   # store current tract
##   tract <- us_tracts[i,]
##   # store current sundown area which intersects the current tract
##   sundown_area <- sundown_areas[sundown_areas$full_name == tract$full_name, ]
## 
##   # store all the block groups which are in the current tract
##   block_groups_in_tract <- us_block_groups[us_block_groups$TRACTCE == tract$TRACTCE &
##                                            us_block_groups$STATEFP == tract$STATEFP &
##                                            us_block_groups$COUNTYFP == tract$COUNTYFP,]
## 
##   # assign variable in_sundown to store whether a block group intersects the current sundown town
##   block_groups_in_county$in_sundown <- st_intersects(block_groups_in_tract, sundown_area, sparse = FALSE)
## 
## 
##   # if the total population of the tract is greater than zero
##   if((sum(block_groups_in_tract$U7B001 * !block_groups_in_tract$in_sundown) +
##        sum(block_groups_in_tract$U7B001 * block_groups_in_tract$in_sundown)) > 0){
##     # this sets population sundown to the proportion of population of the tract which lives in the block groups that intersected the current sundown area over total population in block groups
##     # this estimates how many people currently live in a former sundown town
##     us_tracts[i,]$population_sundown <- sum(block_groups_in_tract$U7B001 * block_groups_in_tract$in_sundown) /
##         (sum(block_groups_in_tract$U7B001 * !block_groups_in_tract$in_sundown) +
##          sum(block_groups_in_tract$U7B001 * block_groups_in_tract$in_sundown))
##   }else{
##     us_tracts[i,]$population_sundown <- NA
##   }
## 
##   setTxtProgressBar(pb, i)
## }
## close(pb)
## 
## # filter out tracts in which the sundown town is less than 0.5% of the tract area
## # this is designed to filter out the cases where a sundown town shares a border with the tract but no area
## us_tracts <- us_tracts %>%
##   filter(percent_sundown > 0.005)


## ---- eval = FALSE-----------------------------------------------------------------------------------------------------------------------------------------
## # read in all tracts
## all_us_tracts <- st_read("C:/Users/isaac/Desktop/HEROP/identifying sundown tracts/data/nhgis0012_shape/nhgis0012_shape/nhgis0012_shapefile_tl2020_us_tract_2020/US_tract_2020.shp")
## # find all tracts which are not in a sundown town (i.e. not included in dataframe us_tracts)
## all_us_tracts <- all_us_tracts %>%
##   select(c(GISJOIN, STATEFP, COUNTYFP, TRACTCE, GEOID, NAME)) %>%
##   st_transform(5069) %>%
##   filter(!(GISJOIN %in% us_tracts$GISJOIN))
## 
## complete_tracts <- bind_rows(us_tracts, all_us_tracts)
## 
## complete_tracts <- rename(complete_tracts, area_sundown = percent_sundown)
## 


## ---- eval = FALSE-----------------------------------------------------------------------------------------------------------------------------------------
## st_write(complete_tracts, "C:/Users/isaac/Desktop/HEROP/identifying sundown tracts/data/all_tracts_proportion_sundown.shp")
## st_write(us_tracts, "C:/Users/isaac/Desktop/HEROP/identifying sundown tracts/data/tracts_with_sundown_towns.shp")
## 

