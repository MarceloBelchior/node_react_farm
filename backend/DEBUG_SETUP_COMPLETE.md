# 🔧 Debug Setup Complete - Brain Agriculture NestJS API

## ✅ Completed Setup

### 1. VS Code Debug Configurations

- **Location**: `.vscode/launch.json`
- **Configurations Available**:
  - Debug NestJS App (with/without env)
  - Debug Built App
  - Attach to Process
  - Debug Jest Tests
  - Debug Single Test File
  - Debug Full Stack (Frontend + Backend)

### 2. Enhanced Package.json Scripts

- **Location**: `backend/package.json`
- **Debug Scripts**:
  ```bash
  npm run debug           # Start with debugger (0.0.0.0:9229)
  npm run debug:brk       # Start with breakpoint on first line
  npm run test:debug      # Debug Jest tests
  npm run debug:setup     # Setup debug environment
  npm run debug:enable    # Enable full debugging
  npm run debug:disable   # Disable debugging
  npm run debug:status    # Show debug status
  ```

### 3. Debug Utilities Created

- **Location**: `backend/src/utils/debug.ts`
- **Features**:
  - API call logging with sanitization
  - Database operation logging
  - Performance metrics tracking
  - Memory usage monitoring
  - Method decorators for automatic instrumentation
  - Profile wrapper for timing operations

### 4. MongoDB Debug Integration

- **Location**: `backend/src/utils/mongo-debug.ts`
- **Features**:
  - Mongoose query debugging
  - Connection event logging
  - Query performance monitoring
  - Slow query detection (>500ms)
  - Service method debug decorators

### 5. Request/Response Debug Interceptor

- **Location**: `backend/src/interceptors/debug.interceptor.ts`
- **Features**:
  - Automatic request/response logging
  - Request timing with slow request warnings (>1000ms)
  - Sensitive data sanitization
  - Query parameter and body logging
  - Error handling with stack traces

### 6. Enhanced Main.ts Configuration

- **Location**: `backend/src/main.ts`
- **Features**:
  - Conditional logging levels based on environment
  - Memory usage tracking at startup
  - Environment variable debugging
  - MongoDB debug integration

### 7. Debug Environment Management

- **Location**: `backend/scripts/debug-setup.js`
- **Features**:
  - Automated .env configuration
  - Debug variable management
  - Quick enable/disable debugging
  - Status reporting

### 8. VS Code Tasks Integration

- **Location**: `.vscode/tasks.json`
- **Tasks Available**:
  - Start Backend Debug
  - Start Backend Debug (Break)
  - Run Tests Debug
  - Build Backend
  - Install Backend Dependencies

### 9. Enhanced VS Code Settings

- **Location**: `.vscode/settings.json`
- **Features**:
  - TypeScript debugging optimization
  - Debug console configuration
  - Inline values display
  - Breakpoint enhancements

### 10. Comprehensive Testing

- **Location**: `backend/src/__tests__/debug-integration.test.ts`
- **Coverage**:
  - Debug utilities testing
  - Interceptor integration testing
  - Performance testing
  - Service decorator testing

## 🚀 How to Use

### Quick Start

1. **Setup Environment**:

   ```bash
   npm run debug:setup
   ```

2. **Enable Full Debugging** (optional):

   ```bash
   npm run debug:enable
   ```

3. **Start Debug Session**:

   ```bash
   npm run debug
   ```

4. **Open VS Code Debugger**:
   - Press `F5` or go to Run and Debug
   - Select "Debug NestJS App"
   - Set breakpoints and start debugging

### Environment Variables

Add to your `.env` file to enable specific debug features:

```env
DEBUG_HEADERS=true        # Log request headers
DEBUG_RESPONSE=true       # Log response data
DEBUG_STACK=true          # Show error stack traces
MONGODB_DEBUG=true        # Enable MongoDB query logging
LOG_LEVEL=verbose         # Maximum logging detail
```

### Service Debug Decorators

Applied to key service methods in:

- `FarmService.create()` and `FarmService.findAll()`
- `ProducerService.create()` and `ProducerService.findAll()`

## 📊 Debug Output Examples

### API Request Logging

```
[DebugInterceptor] 📥 Incoming POST /api/farms
[DebugInterceptor] 🔍 Query params: { page: "1", limit: "10" }
[DebugInterceptor] 📝 Request body: { "name": "Test Farm", ... }
[DebugInterceptor] 📤 Response POST /api/farms - 201 in 245ms
```

### MongoDB Query Logging

```
[MongoDebugUtils] 🗄️ MongoDB Query: {
  "collection": "farms",
  "method": "findOne",
  "query": "{ \"name\": \"Test Farm\" }"
}
```

### Service Method Debugging

```
[MongoDebugUtils] 🚀 FarmService.create called with: [CreateFarmDto]
[MongoDebugUtils] ✅ FarmService.create completed in 156ms
[MongoDebugUtils] 📊 Result: Document with ID 507f1f77bcf86cd799439012
```

### Performance Monitoring

```
[DebugUtils] ⏱️ createFarm took 245ms
[DebugUtils] 🧠 Application Startup: {
  "rss": "45MB",
  "heapTotal": "28MB",
  "heapUsed": "18MB"
}
```

## 🔧 Available VS Code Debug Configurations

1. **Debug NestJS App**: Standard debugging with watch mode
2. **Debug NestJS App (with env)**: Debug with environment file loaded
3. **Debug Built App**: Debug the compiled production build
4. **Attach to Process**: Attach to running Node.js process on port 9229
5. **Debug Jest Tests**: Run all tests with debugger
6. **Debug Single Test File**: Debug currently open test file
7. **Debug Full Stack**: Debug both frontend and backend simultaneously

## 🎯 Next Steps

The debug infrastructure is now complete and ready for use. You can:

1. **Start debugging immediately** with `npm run debug`
2. **Set breakpoints** in VS Code and use F5 to start debugging
3. **Monitor performance** with automatic slow query/request detection
4. **Analyze memory usage** with built-in memory tracking
5. **View detailed logs** in development mode
6. **Test API endpoints** with comprehensive request/response logging

## 📚 Documentation

- **Complete Guide**: `backend/DEBUG_GUIDE.md`
- **Environment Setup**: `backend/.env.debug.example`
- **Integration Tests**: `backend/src/__tests__/debug-integration.test.ts`

## 🛠️ Troubleshooting

If you encounter issues:

1. Check `npm run debug:status` for configuration
2. Ensure port 9229 is not in use
3. Verify VS Code is using the correct launch configuration
4. Check that source maps are enabled
5. Review the DEBUG_GUIDE.md for detailed troubleshooting

The Brain Agriculture NestJS API now has comprehensive debugging capabilities that will significantly improve development productivity and troubleshooting efficiency! 🎉
