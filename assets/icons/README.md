# How to add extra icons

- Go to https://fontello.com/
- Load all of the svg files in the `raw` directory
- Load any new icon as svg (store it in the `raw` directory for future users)
- Select the custom icons and in the `Customize Names` tab delete the pn prefix (e.g. icon-pn-place -> icon-place)
- In the `Customize Codes` tab the codes can be changed (not strictly necessary)
- Change font name in the input field to `pn`
- And in the setting next to it change the CSS prefix to `pn-icon`
- Download the webfont and replace all the `config.json` file and all files in the `font` and `css` directories
- Delete auto-generated margins in the `css/pn.css` and `css/pn-embedded.css` files
