# Author: isaacrand@uchicago.edu
# Date: Feb 9 2022
# Input: Sundown Towns data set saved to your laptop
  #        available in legacies database under public schema (table name: sundown_point)
  #        original data at https://justice.tougaloo.edu/map/
# Output: .csv file with information on original dataset as well as its closest match from openrouteservices geocoder
  #         closest matches determined by confidence of match (from ors) and distance between match and original datapoint

# loading required libraries for data manipulation
library(tidyverse)
library(sf)
# loading required libraries for accessing openrouteservices api
library(httr)
library(jsonlite)

# SETUP -------------------Mess With Parameters Here-------------------------------------------

# n is the number of requests we are going to make in this run of the script
# n <= 1000 will stay within the geocoder's daily call limit for a personal user
n <- 119

# this should be set to the number of rows which have already been processed.
# to process rows 401 to 800 (the second 400 rows in the dataset) set base to 400 and n to 400
base <- 0


# sets a threshold distance (in meters)
# whenever an original data point is more than dist_thresh from its match it is flagged as worrying
# all matches are at least a few meters from the original data point, this should certainly not be zero
dist_thresh <- 5000

# destination file path to write results to
out_file_path <- "C:/Users/isaac/Desktop/HEROP/sundown towns cleaning/data/sundown_towns_best_matches_from_ors-rerun1.geojson"

# reading data in from sundown_towns dataset
sundown_towns <- st_read("C:/Users/isaac/Desktop/HEROP/sundown towns cleaning/data/still_unmatched_sundown_towns.geojson") %>%
  # creating a new column with places full name in format Place, State (e.g. Chicago, IL)
  mutate(full_name = paste(name, state, sep = ", "))

# End Setup ---------------Messing with parameters is more dangerous below-------------------------------------------

# Making and formatting API requests --------------------------------------------------

# creating a vector of api geocoding requests using each place's full name
# you may need to replace my api_key with your own, but mine should work for up to 1000 calls a day
api_requests <- paste("https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf62485727afb4c8354ab592e9c187f4b7b9f1&text=", sundown_towns$full_name, "&boundary.country=US&layers=locality,localadmin,county,neighborhood", sep = "") %>%
  str_replace_all(" ", "%20")

# joining this vector as a column to the sundown_towns dataset
sundown_towns$request <- api_requests

# restricts the sundown_towns dataset to the first n rows after some base row
# n and base are both set above (in setup)
# use to process the base+1'th row to the base+n'th row of the data set
sundown_towns <- sundown_towns[(base+1):(base+n),]
# create a list to store results of each geocoding request
# responses <- vector("list", length = n)

if(n %% 100 == 0){
  for(i in 0:((n-1)/100)){
    print(paste("requesting towns: ", base + (1 + i*100), "to ", base + ((i+1)*100)))
    responses[(1 + i*100):((i+1)*100)] <- map(sundown_towns$request[(1 + i*100):((i+1)*100)], ~GET(.x))
    # we are only allowed 100 calls a minute with my API key
    # after calling the API 100 times in the line above, we tell R to sleep for a minute
    Sys.sleep(61)
  }
} else {
  n_hundreds <- (n - (n %% 100)) / 100
  if(n_hundreds > 0){
    for(i in 0:(n_hundreds-1)){
      print(paste("requesting towns: ", base + (1 + i*100), "to ", base + ((i+1)*100)))
      responses[(1 + i*100):((i+1)*100)] <- map(sundown_towns$request[(1 + i*100):((i+1)*100)], ~GET(.x))
      # we are only allowed 100 calls a minute with my API key
      # after calling the API 100 times in the line above, we tell R to sleep for a minute
      Sys.sleep(61)
    }
    i <- (n-1)/100
  } else {
    i <- 0
  }
  print(paste("requesting towns: ", base + (1 + n_hundreds * 100), "to ", base + (n_hundreds*100 + n %% 100)))
  responses[(1 + n_hundreds * 100):(n_hundreds*100 + n %% 100)] <- map(sundown_towns$request[(1 + n_hundreds * 100):(n_hundreds*100 + n %% 100)], ~GET(.x))
}

# Cleaning API responses ---------------------------------------------------------------------

# create a dataframe to store a row for each possible match of each data point
# speed gain reliant on assumption that average data point has less than 10 possible matches
  # still works if they don't (but the average data point seems to have 1-3 possible matches)
results <- vector("list", length = length(responses) * 10)
# since each data point may generate more than 1 entry into the list, 
# we need a separate list index variable to keep track of where to insert new items
list_index = 1
# looping through each data point in sundown_towns dataset
for(i in 1:nrow(sundown_towns)){
  #check if this api request got a successful resposne. Print error and skip to the next iteration of the loop if not
  if (responses[[i]]$status_code != 200) {
    # print out location requested and standard HTTP status code for any failed request
    # You get HTTP code 429 when you exceed the API call limit, others can be looked up here https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
    print(paste("API Request for ", sundown_towns[i,]$full_name, " failed to process with HTTP Status Code: ", responses[[i]]$status_code, sep = ""))
    if(responses[[i]]$status_code == 429){
      print("You have exceeded your API call limit")
    }
    next()
  }
  
  # identify current row in original sundown towns data set
  current_row <- sundown_towns[i,]
  
  # convert api response to list format (using httr and jsonlite libraries)
  json_results <- fromJSON(rawToChar(responses[[i]]$content))
  # create a list (from json_results) of pairs of coordinates
  # there will be one pair of coordinates for each candidate geocoding match generated by openrouteservices
  candidates <- json_results$features$geometry$coordinates
  # loop through possible matches, and add each to the results list
  for(i in 1:length(candidates)){
    #store information about the possible match
    # ors is short for open route service
    ors_source_layer <- json_results$features$properties$layer[[i]]
    ors_long_name <- json_results$features$properties$label[[i]]
    # this is the confidence level of each match. 
    # as far as I can tell confidence = 1 is best, confidence = 0.4 is bad. Other numbers have not appeared
    ors_confidence <- json_results$features$properties$confidence[[i]]
    # store the latitude and longitude of ORS geocode
    ors_long <- candidates[[i]][1]
    ors_lat <- candidates[[i]][2]
    # store the original data set's coordinates
    coords <- current_row$geometry %>%
      st_coordinates()
    orig_long <- coords[1]
    orig_lat <- coords[2]
    # add all this information to the results list
    results[[list_index]] <- c(current_row$full_name,
                               current_row$type,
                               current_row$confirmed,
                               current_row$sign,
                               current_row$ordinance,
                               current_row$showcase,
                               ors_source_layer,
                               ors_long_name,
                               ors_confidence,
                               ors_long,
                               ors_lat,
                               orig_long,
                               orig_lat)
    # increment the list index so the next row is inserted correctly
    list_index <- list_index + 1
  }
}

# necessary (I think) middle step: combine the results data so that it is a gross dataframe
results <- do.call(rbind, results)  %>%
  data.frame() %>%
  map(unlist)

# recombine the results data so that it is a nice dataframe
results <- do.call(cbind, results) %>%
  data.frame()

# rename columns of results dataframe
names(results) <- c("full_name", "type", "confirmed", "sign", "ordinance", "showcase", "ors_source_layer", "ors_long_name", "ors_confidence", "ors_long", "ors_lat","orig_long", "orig_lat")

results <- results %>%
  # recast latitudes and longitudes as numeric types (have been stored as characters)
  mutate(ors_long = as.numeric(ors_long)) %>%
  mutate(ors_lat = as.numeric(ors_lat)) %>%
  mutate(orig_long = as.numeric(orig_long)) %>%
  mutate(orig_lat = as.numeric(orig_lat)) %>% 
  # make a new column which stores original geometry as sf points
  mutate(orig_geom = map2(orig_long, orig_lat, ~st_point(c(.x,.y)))) %>%
  # convert results dataframe to sf object using the OPENROUTESERVICES POINTS as the geometry
  st_as_sf(coords = c("ors_long", "ors_lat"), crs = 4326)

# Determining and Assigning Best Geocode for each original Data Point ----------------------------------------------

# calculate the distance between each original datapoint and each of its matches provided by openroute services
results$dist_orig_ors <- st_distance(results$geometry, 
                                     st_sfc(results$orig_geom, crs = 4326),
                                     by_element =  TRUE)

# create a list to store the best matches corresponding to each row
best_matches <- vector("list", length = n * 10)


# loop through each of the original points from the sundown town dataset
list_index <- 1
for(i in 1:length(unique(results$full_name))){
  # store name of a place from original dataset
  current_town <- unique(results$full_name)[i]
  # create a data frame of all the possible matches of this place
  matches <- results[results$full_name == current_town, ] %>%
    # sort matches so one's with highest confidence geocoding are at top
    # ties in confidence are broken by distance from point in original data set to geocoded result
    arrange(desc(ors_confidence), dist_orig_ors) %>%
    # create boolean variable, TRUE if the distance the ors geocode is from the original is greater than dist_thresh (from setup section)
    mutate(worrying_distance = as.numeric(dist_orig_ors) > dist_thresh) %>%
    # create boolean variable, TRUE if ors is completely confident in its match
    mutate(worrying_confidence = ors_confidence < 1)
 
  # this number represents the least worried we are about any of our matches
  # it is zero when ors is fully confident in the match and it is within dist_thresh of the original
  # it is one when either of those things is not true, but not both
  # it is two when both of those things are not true
  least_worrying <- min(matches$worrying_confidence + matches$worrying_distance)
  print(least_worrying)
  # our best matches are the we are as worried about as our least worrying option
  best_we_can_get <- matches %>%
    filter(worrying_distance + worrying_confidence == least_worrying, .keep_all = TRUE)
  # add all our best matches to the list
  for(j in 1:nrow(best_we_can_get)){
    best_matches[[list_index]] <- best_we_can_get[j,]
    list_index <- list_index + 1
  }
  # if worrying_distance is TRUE for all best matches, make an additional row for the original geometry
  # # I'm guessing this will most often be places that do not currently exist (e.g. Baker, NJ; Kotlin, IL) or possibly wrong but confident ORS geocodes (e.g. Adams, PA)
  print(best_we_can_get$worrying_confidence)
  print(best_we_can_get$worrying_distance)
  if(every(best_we_can_get$worrying_distance, ~ . == TRUE)){
    print(best_we_can_get[j,]$full_name)
    best_we_can_get[j,]$worrying_distance <- FALSE
    best_we_can_get[j,]$worrying_confidence <- TRUE
    # Restoring geometry from original data set and adding it to best matches as long as both coordinates are nonzero
    if(best_we_can_get[j,]$orig_lat != 0 & best_we_can_get[j,]$orig_long != 0){
      best_we_can_get[j,]$geometry <- st_sfc(best_we_can_get[j,]$orig_geom, crs = 4326)
      best_matches[[list_index]] <- best_we_can_get[j,]
      list_index <- list_index + 1
    }
  }
  # # set best match to first row in dataframe having been ordered by confidence and then distance from original data point
  # best_match <- matches[1,]
  # # this shouldn't happen, usually ors coughs up something (even if it's totally ridiculous)
  # # but this checks to see if no matches were generated. If none were, it prints a message and skips to the next town
  # if(nrow(best_match) == 0){
  #   print(paste("No matches found for", current_town))
  #   next()
  # }
  # 
  # # if the ors has full confidence in the best match and it is within dist_thresh of original point, we're not worried
  # if(best_match$ors_confidence == 1 & as.numeric(best_match$dist_orig_ors) < dist_thresh){
  #   best_match$worrying_distance <- FALSE
  #   best_match$worrying_confidence <- FALSE
  #   best_matches[[i]] <- best_match
  #   next()
  # }
  # # if the best match is within dist_thresh of the original point but ors doesn't believe in itself, we're worried
  # if(as.numeric(best_match$dist_orig_ors) < dist_thresh){
  #   best_match$worrying_distance <- FALSE
  #   best_match$worrying_confidence <- TRUE
  #   best_matches[[i]] <- best_match
  #   next()
  # }
  # # if ors is fully confident but the match is off by more than dist_thresh from the original point we're worried. either georef could be wrong
  # if(best_match$ors_confidence == 1){
  #   best_match$worrying_distance <- TRUE
  #   best_match$worrying_confidence <- FALSE
  #   best_matches[[i]] <- best_match
  #   next()
  # }
  # # we are only here if the best match (by confidence and distance) was not at full confidence (conf = 1) 
  # # and was also not within 5 kilometers of the original datapoint
  # # at this point the best match is not a very good match, and so we will default to original geometry
  # # I'm guessing this will most often be places that do not currently exist (e.g. Baker, NJ; Kotlin, IL)
  # best_match$worrying_distance <- TRUE
  # best_match$worrying_confidence <- TRUE
  # # Restoring geometry from original data set as long as both coordinates are nonzero
  # if(best_match$orig_lat != 0 & best_match$orig_long != 0){
  #   best_match$geometry <- st_sfc(best_match$orig_geom, crs = 4326)
  # }
  # best_matches[[i]] <- best_match

}

# combine all the best matches into a dataframe
best_matches <- do.call(rbind, best_matches) %>%
  data.frame() %>%
  st_sf()

# double check that all sundown towns in the original dataset have at least one match
if(length(which(!sundown_towns$full_name %in% best_matches$full_name)) == 0){
  print("all sundown towns were matched by open route services")
}else{
  print("the following towns were unmatched by open route services")
  sundown_towns[which(!sundown_towns$full_name %in% best_matches$full_name),]$full_name
}

# Formatting and writing output ----------------------------------------------------------------
best_matches <- best_matches %>% select(-c(orig_geom))
st_write(best_matches, out_file_path, append = TRUE)

