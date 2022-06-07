# About this code repository

## Quickstart

1. Make sure to install [Github](https://desktop.github.com/) or [Git](https://git-scm.com/book/en/v2/Getting-Started-The-Command-Line), and [Nodejs](https://nodejs.org/en/)
2. After installing node, install yarn using `npm i -g yarn`
3. Clone this repository to your computer using `git clone https://github.com/GeoDaCenter/geospatial-legacy-redlining.git`
4. In your terminal from this directory, run `yarn`. This will install the packages needed to use this repository
5. Again in your terminal, run `yarn dev` to begin development. Your terminal will give you a local website URL to view the development version of the site. Usually, this is `localhost:3000`. Enter this in your browser to see the site.
6. Open your code editor of choice like [Visual Studio Code](https://code.visualstudio.com/) and begin making changes.
7. When you are happy with your edits, [commit and push](https://github.com/git-guides/git-commit) your changes to Github. This will trigger the deploy process and your changes should go live momentarily

Finally, to access Mapbox services, you'll need an API key that you can get by signing up on Mapbox.com. The free tier is generous. After you sign up, create a file in the root folder of this repo called ".env.local" and add a line like the example below with your API key:

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.abcdefghijklmnop
```

This file will not be uploaded to Github, so this API key will not be exposed to search and index services online.

## Repo structure and framework

This repo uses [NextJS](https://nextjs.org/), a Javascript framework based on [React](https://reactjs.org/). Here is the folder structure:

```
🗀 Repo root
| 📁 pages (page file, where the file name (eg. `map.js`) is the name of the website route (eg. mysite.com/map)
| 📁 components (Re-usable component files)
| 📁 utils (Utility functions and helpers)
| 📁 public (public assets and images like icons and data)
| 📁 styles (cascading style sheets - css styling files)
| 📁 documentation (ancillary documentation files)
```

Non-tracked folders and files:

```
| 📁 .next (nextjs temporary and build files, do not edit)
| 📁 node_modules (the installed packages needed for this site, do not edit)
```

## Updating Data

To update data, simply modify the relevant data files in the `public` folder and commit changes to the github repo. Data are available as comma separated values (CSV) data (in `public/csv`) and GeoJSON spatial data (in `public/geojson`).

## Data Schemas

### Spatial data (geojson) - public/geojson

1860 County Census
// todo
HOLC Boundaries
// todo
Lynchings
// todo

### Tabular data (csv) - public/csv

**Sundown Towns (1870-1970)**

Attribution: Sundown Towns: James W. Loewen and heirs (Nick Loewen) - History and Social Justice, Tougaloo College, 2022.

Columns:

- place_type: place type based on census data
- full_name: name of location
- type: original from James Loewn data, not used
- confirmed: status of sundown town confirmation
    - 1: "Don't Know"
    - 2: "Possible"
    - 3: "Probable"
    - 4: "Surely"
    - 8: "Unlikely / Always Biracial"
    - 9: "Black Town or Township"
- sign: original from James Loewn data, not used
- ordinance: original from James Loewn data, not used
- showcase: original from James Loewn data, not used
- orig_long: longitude in WGS84, from original James Loewen data
- orig_lat: latitude in WGS84, from original James Loewen data
- name: name of place, excluding state
- state: name of state, as two letter abbreviation
- id: row ID from original data
- relocated_while_cleaning: indicator of if this point moved during data processing
- x: longitude in WGS84, revised based on Isaac Rand's work
- y: longitude in WGS84, revised based on Isaac Rand's work


**White Supremacist Attacks on Black Communities (1824-1974)**

Attribution: White Supremacist Attacks on Black Communities (1824-1974): Liam Hogan and contributors, 2015.

Columns

- name: name of event
- Location: name of location
- Date: date or date range
- Fatalities: number of lives lost or injuries
- Regugees: number of people displaced
- Narrative/Notes: additional information
- Source: source of information - note, some links are no longer active
- Overflow: additional information
- lon: longitude in WGS84 projection
- lat: latitude in WGS84 projection

## Updating Map Design and Text

To update map colors, labels, or attribution information, edit the `map.config.js` file in the repository root. There are two main pieces of information to work on here:

### Layers

The Layers object has an entry for each data layer with a brief id like 'slavery' and 'sundown'. In each of these entries the configuration for the label, data, attribution, and map bins are available to edit. Here are the available options:

- label: how the map layer appears in the checkbox menu
- data: path to the data file relative to the public folder - eg. `csv/mass-violence.csv`
- attribution: data attribution, as appears in the bottom right
- mapBins: the numeric or text-based breakpoints for the map bins
- categorical: if a data set has a series of categories instead of continuous, numeric values, `categorical` can be set to `true`
- mapColors: the colors for each map bin. These should be formatted using 3 values, red, green, blue, and they have an optional 4th value (opacity). Each value has a range between 0 and 255, for example, `[255,0,0]` would be solid red (red 255, green 0, blue 0). `[255,0,0,120]` would be red at approximately 50% opacity (120/255 ~= 50%)
- separateZero: if you wish to separate out values that are exactly 0 from the color scale, set this option to true
- zeroColor: if you are separating out zero values and wish to set a particular color for zero values, set that here


### Technical Layer Settings

Technical layer settings allow you to interact directly with the rendering code, provided by [DeckGL](https://deck.gl/). Additionally, there are two additional parameters for tooltip configuration:

- tooltipValidateFunction: a function to validate if a geometry has the required data to pass to the tooltip. This should check if a basic property or properties are present in the feature
- tooltipDataFunction: a function that should return a list/array of objects with `title` and `text` properties derived from a given feature. This draws the content that will be visible in the hover tooltip.


### Interactive Layer Settings
Some interactive layer settings require being located in the map component itself for access to things like click events and map zoom scaling. See `interactiveLayerSettings` in `MapComponent` for these instances. 

## Key Libraries

1. Mapping - [DeckGL](https://deck.gl/)
2. Interface Elements - [React Spectrum](https://react-spectrum.adobe.com/react-spectrum/)

## Common Issues

- My changes aren't showing up on the live site, why?

  > There are a few reasons your build might not be working. Most commonly, there may be an error in your code that is either breaking the build, or is flagged as an issue and must be corrected. The site build process will not complete with errors present.
  > Try running `yarn build` on your local machine and see if there are any warnings or errors present, usually from eslint, a helper program to remove syntactic and common errors. If you need to tell eslint to ignore an error that it flags, you can add the commented to `eslint-disable-line` in the relevant code -- read more in [this article on eslint](https://masteringjs.io/tutorials/eslint/ignore#:~:text=The%20%2F%2F%20eslint%2Ddisable%2Dline,using%20%2F*%20eslint%2Ddisable%20*%2F%20.&text=If%20you%20put%20%2F*%20eslint,rule%20for%20the%20entire%20file.).


- The development server won't run.
    > Especially if you see the error "module not found" make sure that you've run `yarn` or `yarn install` from the repository root in your terminal to install the needed pakcages. If it still won't work, try deleting your `node_modules` folder as well as the files `yarn.lock` and `package-lock.json` in the root repo folder.


---
## _Boilerplate Docs Below_

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
