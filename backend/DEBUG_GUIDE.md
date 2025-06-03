# NestJS Debug Setup Guide

## Overview

This project is configured with comprehensive debugging capabilities including VS Code debug configurations, enhanced logging, MongoDB query debugging, and performance monitoring.

## Quick Start

### 1. VS Code Debugging

The project includes several debug configurations in `.vscode/launch.json`:

- **Debug NestJS App**: Start the app with debugger attached
- **Debug NestJS App (with env)**: Start with environment file loaded
- **Debug Built App**: Debug the compiled production build
- **Attach to Process**: Attach to a running Node.js process
- **Debug Jest Tests**: Run tests with debugger
- **Debug Single Test File**: Debug specific test file
- **Debug Full Stack**: Debug both frontend and backend

### 2. Available Scripts

```bash
# Start with debugging enabled
npm run debug

# Start with debugger that breaks on first line
npm run debug:brk

# Debug tests
npm run test:debug

# Regular development start
npm run start:dev
```

### 3. Debug Environment Variables

Copy `.env.debug.example` to your `.env` file and enable desired debug options:

```env
# Enable detailed request/response debugging
DEBUG_HEADERS=true
DEBUG_RESPONSE=true
DEBUG_STACK=true

# MongoDB debugging
MONGODB_DEBUG=true
```

## Debugging Features

### 1. Request/Response Interceptor

The `DebugInterceptor` automatically logs:

- Incoming request details (method, URL, query, body)
- Response timing and status codes
- Slow request warnings (>1000ms)
- Error details with stack traces

### 2. MongoDB Query Debugging

- Automatic query logging with mongoose debug mode
- Query performance monitoring
- Connection event logging
- Slow query detection (>500ms)

### 3. Service Method Debugging

Services decorated with `@MongoDebugUtils.createServiceDebugDecorator()` provide:

- Method call logging with parameters
- Execution time tracking
- Result summaries
- Error logging

### 4. Performance Monitoring

- Memory usage tracking at startup
- Request timing with warnings for slow operations
- Database query performance metrics

## Using Debug Utilities

### 1. DebugUtils Class

```typescript
import { DebugUtils } from "./utils/debug";

// Log API calls
DebugUtils.logApiCall("POST", "/api/farms", body, query);

// Log database operations
DebugUtils.logDbOperation("CREATE", "farms", filter, data);

// Log performance
const startTime = Date.now();
// ... operation ...
DebugUtils.logPerformance("createFarm", startTime);

// Log memory usage
DebugUtils.logMemoryUsage("After farm creation");
```

### 2. Method Decorators

```typescript
import { MongoDebugUtils } from "./utils/mongo-debug";

@Injectable()
export class FarmService {
  @MongoDebugUtils.createServiceDebugDecorator("FarmService")
  async create(createFarmDto: CreateFarmDto): Promise<Farm> {
    // Method implementation
  }
}
```

### 3. Profile Wrapper

```typescript
import { DebugUtils } from "./utils/debug";

const result = await DebugUtils.profile("Complex Operation", async () => {
  // Your complex operation here
  return await complexOperation();
});
```

## Debug Output Examples

### Request Logging

```
[DebugInterceptor] 📥 Incoming POST /api/farms
[DebugInterceptor] 📝 Request body: {
  "name": "Farm Test",
  "totalArea": 100,
  "agriculturalArea": 60,
  "vegetationArea": 40
}
[DebugInterceptor] 📤 Response POST /api/farms - 201 in 245ms
```

### MongoDB Query Logging

```
[MongoDebugUtils] 🗄️  MongoDB Query: {
  "collection": "farms",
  "method": "findOne",
  "query": "{ \"producerId\": \"507f1f77bcf86cd799439011\", \"name\": \"Farm Test\" }"
}
```

### Service Method Logging

```
[MongoDebugUtils] 🚀 FarmService.create called with: [{ name: "Farm Test", ... }]
[MongoDebugUtils] ✅ FarmService.create completed in 245ms
[MongoDebugUtils] 📊 Result: Document with ID 507f1f77bcf86cd799439012
```

## VS Code Debugging Tips

### 1. Setting Breakpoints

- Click in the gutter next to line numbers to set breakpoints
- Use conditional breakpoints for specific scenarios
- Set logpoints for non-intrusive debugging

### 2. Debug Console

- Evaluate expressions while debugging
- Inspect variables and their values
- Execute code in the current context

### 3. Call Stack

- Navigate through function calls
- See the execution path that led to current state
- Jump between stack frames

### 4. Variables Panel

- Inspect local, closure, and global variables
- Expand objects to see their properties
- Watch specific expressions

## Troubleshooting

### Common Issues

1. **Debugger not attaching**

   - Ensure the debug port (9229) is not in use
   - Check that the application is started with debug flags
   - Verify VS Code is using the correct launch configuration

2. **Breakpoints not hitting**

   - Ensure source maps are enabled
   - Check that the file paths match between source and build
   - Verify the code is actually being executed

3. **Too much debug output**
   - Adjust environment variables to reduce logging
   - Use specific debug decorators only where needed
   - Filter logs by context in the debug console

### Debug Environment Reset

```bash
# Clear compiled files
npm run build:clean

# Restart with fresh debug session
npm run debug:brk
```

## Best Practices

1. **Use appropriate debug levels**: Only enable verbose debugging when needed
2. **Remove sensitive data**: Debug utilities automatically sanitize passwords and tokens
3. **Monitor performance impact**: Debug logging can slow down operations
4. **Use breakpoints strategically**: Place them at key decision points and error boundaries
5. **Clean up debug code**: Remove temporary debug statements before committing

## Integration with External Tools

### 1. MongoDB Compass

- Connect to see actual database queries
- Monitor query performance
- Analyze query execution plans

### 2. Chrome DevTools

- Use Node.js debugging features
- Profile memory and CPU usage
- Analyze performance bottlenecks

### 3. Postman/Thunder Client

- Test API endpoints with detailed logging
- Monitor request/response timing
- Validate API behavior

## Next Steps

To further enhance debugging:

1. Add custom error filters with enhanced debugging
2. Implement request correlation IDs for distributed tracing
3. Add database connection pool monitoring
4. Integrate with external monitoring tools (e.g., New Relic, DataDog)
5. Add custom metrics collection for business logic
