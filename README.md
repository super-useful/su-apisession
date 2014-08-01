# su-apisession

session handling for [su-apiserver](https://github.com/super-useful/su-apiserver) using redis.

## api

### session

``` javascript

   var session = require( 'su-apisession' );

```

#### set( data:Object ):String|Null

creates a new session using the passed `data:Object` as the initial session data.

returns a generated token you will need to access the session data.

``` javascript

   var token = yield session.set( { foo : 'bar' } );

```

#### get( token:String ):Object|Null

returns a session `Object` linked to the passed `token:String` and it has not timed out: otherwise `null` is returned.

``` javascript

   var user_session = yield session.get( token );

```

#### update( session:Object ):Object|Null

updates the passed `session:Object` and returns it, or `null` if complications arose.

``` javascript

   user_session.data.items = [1, 2, 3]; // add some more data to the session

   user_session = yield session.update( user_session );

```

#### cache( token:String, key:String, data:Object ):Boolean

caches the passed `data:Object` against `key:String` for the session `token:String`.

returns `true|false` to indicate whether caching was successful.

this is useful for caching responses for REST calls that could otherwise slow down your server(s).

``` javascript

   var success = yield session.cache( token, 'http://example.com/foo/bar', { foo : 'bar' } );

```

#### getCached( token:String, key:String ):Object|Null

returns any data `Object` that has been cached against `key:String` for the session `token:String`, or `null` if nothing was found.

``` javascript

   var cached_data = yield session.getCached( token, 'http://example.com/foo/bar' );

```

#### invalidate( token:String ):Boolean

invalidates the session bound to `token:String` and returns `true|false` to indicate whether invalidation was successful.

``` javascript

   var is_valid = yield session.invalidate( token );

```

### daemon

use this if you want a background task that automatically invalidates and removes sessions from the database if they have timed out.

``` javascript

   var daemon = require( 'su-apisession/daemon' );

```

#### cleanup()

manually force the daemon to run its cleanup task — this is used internally when the daemon is started.

``` javascript

   yield daemon.cleanup();

```

#### listen( callback:Function )

if you want to execute tasks on expired sessions then add a listener callback to the daemon.

handy if you want to clean up other stuff when a session is timed out and removed from the database.

``` javascript

   daemon.listen( function( token, data ) {
   } );

   daemon.listen( require( 'path/to/background/cleanup/task' ) );

```

#### start()

start the daemon.

``` javascript

   daemon.start();

```

#### start()

stop the daemon.


``` javascript

   daemon.stop();

```

### request/response caching
