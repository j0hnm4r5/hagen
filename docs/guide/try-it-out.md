# Try It Out

Experience Hagen interactively in your browser! Type commands in the terminal below and see the results instantly.

## Interactive REPL

<Terminal :editable="true" title="Interactive Hagen REPL" />

## Available Commands

Try these commands in the REPL above:

### Basic Logging

```javascript
hagen.log('API', 'Request received')
hagen.log('DATABASE', 'Query executed')
hagen.log('WORKER', 'Job processed')
```

### Log Levels

```javascript
hagen.info('CONFIG', 'Configuration loaded')
hagen.success('DB', 'Connection established')
hagen.warn('CACHE', 'Cache size exceeding limit')
hagen.error('API', 'Request timeout')
```

### Multiple Arguments

```javascript
hagen.log('USER', 'User logged in', 'ID: 123')
hagen.success('API', 'Response time:', '45ms')
```

### Utility Commands

- `help` - Show available commands
- `clear` - Clear the terminal

## Command Syntax

All Hagen log methods follow this pattern:

```javascript
hagen.<method>('<LABEL>', '<message>', ...additionalArgs)
```

Where `<method>` is one of:
- `log` - General logging with auto-colored label
- `info` - Informational message (blue with 'i' icon)
- `success` - Success message (green with '✓' icon)
- `warn` - Warning message (yellow with '!' icon)
- `error` - Error message (red with '✕' icon)

## Tips

- Press **↑** and **↓** arrow keys to navigate command history
- Type `clear` to clear the terminal
- Type `help` for a quick reference
- Labels are case-sensitive and will be auto-colored consistently

## Examples to Try

### Server Logs
```javascript
hagen.info('SERVER', 'Starting up...')
hagen.success('SERVER', 'Listening on port 3000')
hagen.log('HTTP', 'GET /api/users')
hagen.success('HTTP', '200 OK')
```

### Database Operations
```javascript
hagen.log('DB', 'Connecting to database')
hagen.success('DB', 'Connection established')
hagen.log('DB', 'Running migrations')
hagen.success('DB', 'All migrations complete')
```

### Error Handling
```javascript
hagen.warn('AUTH', 'Rate limit approaching')
hagen.error('AUTH', 'Authentication failed')
hagen.error('DB', 'Connection lost')
```

## Next Steps

Ready to use Hagen in your project? 

- [Installation Guide](/guide/installation) - Get started with Hagen
- [Configuration](/guide/configuration) - Customize your logger
- [Log Levels](/guide/log-levels) - Deep dive into each log level
- [Examples](/examples/) - Real-world usage examples
