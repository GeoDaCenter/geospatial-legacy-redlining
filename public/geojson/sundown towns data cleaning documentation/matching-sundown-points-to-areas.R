# loading libraries for spatial data manipulation
library(sf)
library(tidyverse)

# setup -------------------------------------------------------

out_file_path <- "C:/Users/isaac/Desktop/HEROP/sundown towns cleaning/data/sundown_towns_areal_matches-cleaner-rerun1.shp"

# read in data ------------------------------------------------


# read in the sundown towns with their best matches from openrouteservices geocoder
# this is the file written by matching-original-data-to-openrouteservice-geocode.R
sundown_towns <- st_read("C:/Users/isaac/Desktop/HEROP/sundown towns cleaning/data/sundown_towns_best_matches_from_ors-rerun1.geojson")

# read in state boundaries (NHGIS 2020)
states <- st_read("C:/Users/isaac/Desktop/HEROP/sundown towns cleaning/data/nhgis_counties_places_cities_2020/nhgis0010_shapefile_tl2020_us_state_2020/US_state_2020.shp")
# keep only the geometry and the USPS two letter code for each state
states <- states %>% 
  select(c("STUSPS")) %>%
  st_transform(4326)

# read in county boundaries (NHGIS 2020)
counties <- st_read("C:/Users/isaac/Desktop/HEROP/sundown towns cleaning/data/nhgis_counties_places_cities_2020/nhgis0009_shapefile_tl2020_us_county_2020/US_county_2020.shp") 
# keep only the county name and geometry
counties <- counties %>% 
  select(c("NAME", "NAMELSAD", "LSAD")) %>%
  # make a new variable to store what type of place this is (to be matched with ors source layer)
  mutate(place_type = "county") %>%
  st_transform(4326)

# read in county subdivision (towns, townships, boroughs, etc) boundaries (NHGIS 2020)
county_subdivisions <- st_read("C:/Users/isaac/Desktop/HEROP/sundown towns cleaning/data/nhgis_counties_places_cities_2020/nhgis0011_shapefile_tl2020_us_cty_sub_2020/US_cty_sub_2020.shp") 
# keep only the county subdivision name and geometry
county_subdivisions <- county_subdivisions %>% 
  select(c("NAME", "NAMELSAD", "LSAD")) %>%
  # make a new variable to store what type of place this is (to be matched with ors source layer)
  mutate(place_type = "localadmin") %>%
  st_transform(4326)

# begin a combined sf dataframe to hold all areas which are candidates to be sundown towns
all_areas <- rbind(counties, county_subdivisions)

# remove the individual counties and county_subdivisions sf objects
# they are large and they are redundant with the all_areas sf object just created
rm(counties)
rm(county_subdivisions)

# read in places (within county subdivisions) boundaries (NHGIS 2020)
places <- st_read("C:/Users/isaac/Desktop/HEROP/sundown towns cleaning/data/nhgis_counties_places_cities_2020/nhgis0009_shapefile_tl2020_us_place_2020/US_place_2020.shp")
# keep only the place name and geometry
places <- places %>% 
  select(c("NAME", "NAMELSAD", "LSAD")) %>%
  # make a new variable to store what type of place this is (to be matched with ors source layer)
  # any LSAD I generated was character based. All LSAD's which the census made (except a few which we don't use here) are numeric
  # LSAD's I made:
    # un - unincorporated community
    # gh - ghost town
    # nb - neighborhood (of a larger city)
    # ge - geologic feature (lakes, islands)
  mutate(place_type = if_else(is.na(as.numeric(LSAD)),  "uncertain_area_not_in_census", "locality")) %>%
  st_transform(4326)

# append local places to the all_areas sf object created above (with counties and county subdivisions)
all_areas <- rbind(all_areas, places)

# remove the places sf object because it is redundant with all_areas and absolutely massive.
rm(places)


# add attributes for state and match quality ----------------------------------------------------

# st_join here is based on intersections, if a county intersects two states there will be two rows for it in the results (one for each state). 
# Since we're going to use a check on the state name later to join places along with a point in polygon this shouldn't be a problem
areas_containing_sdtowns <- all_areas %>%
  # first join to sundown_towns dataset, 
  # we do an inner join so we keep only the areas which intersect a sundown town point. This speeds up the rest siginificantly
  st_join(sundown_towns, left = FALSE) %>%
  st_join(states) %>%
  # create full name variables for each row (one with and one without LSAD information about what type of place it is)
  mutate(full_name_no_lsad = paste(NAME, STUSPS, sep = ", ")) %>%
  mutate(full_name_lsad = paste(NAMELSAD, STUSPS, sep = ", ")) %>%
  # create a variable, TRUE if the full_name from the original data set is not matched by the name of the area (with or without LSAD)
  mutate(no_name_match = full_name != full_name_no_lsad & full_name != full_name_lsad) %>%
  # create a variable, TRUE if the type of place which it intersects is not the same type of place it cames to be (e.g. if ors found a county but the area is a county subdivision)
  mutate(source_mismatch = ors_source_layer != place_type) 

# make final data set for best areal matches to each point ------------------------

# create a list to store best area matches for each point
sundown_towns_areal_matches <- vector("list", length = nrow(areas_containing_sdtowns)*5)
# used to insert into the list (necesarry since some points have multiple matches equally likely to be correct which will both be inserted)
list_index = 1

for(i in 1:length(unique(areas_containing_sdtowns$full_name))){
  current_town_name <- unique(areas_containing_sdtowns$full_name)[i]
  # slice all areas which contain sundown towns down to just the one's that contain the current town we're worried about
  possible_matches <- areas_containing_sdtowns %>% 
    filter(full_name == current_town_name) %>%
    # for addition, TRUE = 1 and FALSE = 0 so higher numbers implies more worry
    mutate(major_causes_for_worry = no_name_match + source_mismatch) %>%
    mutate(minor_causes_for_worry = worrying_distance + worrying_confidence)
  
  # the best matches we can get have the lowest possible major causes for worry (name mismatch and source mismatch)
  # includes in the output any matches which are tied for lowest possible causes
  best_we_can_get <- possible_matches %>%
    filter(major_causes_for_worry == min(possible_matches$major_causes_for_worry))
  
  # insert all the best matches into the list
  for(j in 1:nrow(best_we_can_get)){
    sundown_towns_areal_matches[[list_index]] <- best_we_can_get[j,]
    list_index <- list_index + 1
  }
}

# convert the list to a dataframe
sundown_towns_areal_matches <- do.call(rbind, sundown_towns_areal_matches) %>%
  data.frame()

# write output ---------------------------------------------------------
st_write(sundown_towns_areal_matches, out_file_path, append = TRUE)


