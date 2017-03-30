# Dropdown remote JSON
## Restricting URL to dropdown list
Edit the `default_config.yaml` file to point to a JSON file hosted somewhere. 

```json
[
    {
        "label": "China Conference",
        "url": "https://someconference.com/visualisation",
    },
    {
        "label": "London Conference",
        "url": "https://someconference.com/visualisation",
    }
]
```

If the request for the JSON file fails you should still be able to input a URL. I think input with dropdown option to select predefined.

## Reasoning
From experience when clients use an app like this at events, there is occasionally a problem that has resulted from a typo in the URL. Eliminating this potential issue will save time with technical support and make the user setting it up more confident in the app.

## Secruity
Assuming this application is used at an event, how private is this data? The URL can only really be found through viewing the source of the app itself. So whoever has access to the application will probably already have knowledge of the events.

If someone does have access to the URL then the chances of them knowing about the events already is highly likely.

If the content that is being displayed is really private and should not be accessed outside of an event then you can disable the dropdown or precomile it inside the app.

## Pros
- Easy setup.
- Reduced technical support.
- Easy hosting.
- Fallback to input when internet fails or other error.

## Cons
- Requires internet (they need internet anyway soo).
- Requires dev time to create, edit and host a JSON file somewhere.
- URL can not change.
