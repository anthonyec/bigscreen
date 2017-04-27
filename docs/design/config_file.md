# Config File
## Requirements
- Read config file located within the current working dir.
- Store config file in permanent system settings.
- Provide easy way to access settings within any module (look into npm packages that already do this).

## Reason for choosing YAML format over TOML, JSON or INI
### YAML
#### Pros
- Easy to write.
- Understandable by developers and non-developers alike.
- Support for nice looking comments
- Stable standard.
- Larger support base.
- File format communicates it's meaning more than a TOML file.

#### Cons
- Identation used for syntax. Not so bad if you keep things flat but still.

### JSON
#### Pros
- Large support.
- Understandable by developers.
- Parse and encode are built into JS. No external dependency.

#### Cons
- Does not support comments.
- Syntax is harder / stricter. Makes edits more likely to fail.
- Not friendly for non-developers.

### TOML
#### Pros
- Nice commnets
- Standardised
- Small support but active (rust package manager cargo use it).

#### Cons
- "WTF is a TOML file" by developers.
- Smaller support.
- Less stable standard.
- Do we need another standard.

### INI
#### Pros
- Easy to write.
- Easy to understand.
- Hey its a text file

#### Cons
- INI file is not standardised.
- INI file has weird way to add comments.
