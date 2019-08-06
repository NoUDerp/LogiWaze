// #include <iostream>
// #include <node_api.h>
// #include <sstream>
// #include <string>

// #include "napi-macros.h"
// #include "osrm-text-instructions.h"

// #define DECLARE_NAPI_METHOD(name, func)                                                              \
//   { name, 0, func, 0, 0, 0, napi_default, 0 }

// // check if napi_status is napi_ok, throw error if not
// void checkNapiStatus(napi_status status, napi_env env, const char* error_message) {
//   if (status != napi_ok) {
//     napi_throw_error(env, NULL, error_message);
//   }
// }
// size_t get_size_utf8(napi_env env, napi_value arg) {
//   size_t str_size;
//   napi_status status;
//   status = napi_get_value_string_utf8(env, arg, nullptr, 0, &str_size);
//   checkNapiStatus(status, env, "Failed to get arg string length");
//   return ++str_size;
// }


// namespace node_osrmti {

// class OSRMTextInstructions {
// public:
//   static napi_value Init(napi_env env, napi_callback_info info) {
//     napi_status status;
//     napi_property_descriptor properties[] =
//         {DECLARE_NAPI_METHOD("compile", OSRMTextInstructions::compile)};

//     napi_value osrmti_constructor;
//     status = napi_define_class(env, "OSRMTextInstructions", NAPI_AUTO_LENGTH, New, nullptr, 1, properties, &osrmti_constructor);
//     checkNapiStatus(status, env, "Failed to define class");

//     status = napi_create_reference(env, osrmti_constructor, 1, &constructor);
//     checkNapiStatus(status, env, "Failed to create constructor reference");

//     return osrmti_constructor;
//   }

//   static void Destructor(napi_env env, void* nativeObject, void* finalize_hint) {
//     delete reinterpret_cast<OSRMTextInstructions*>(nativeObject);
//   }

//   static napi_value compile(napi_env env, napi_callback_info info) {
//     NAPI_ARGV(6);

//     napi_value jsthis;
//     napi_status status;

//     size_t language_size = get_size_utf8(env, argv[0]);
//     size_t json_size = get_size_utf8(env, argv[1]);
//     size_t waypoint_name_size = get_size_utf8(env, argv[4]);

//     NAPI_ARGV_UTF8(language, language_size, 0);
//     NAPI_ARGV_UTF8(json, json_size, 1);
//     NAPI_ARGV_INT32(legIndex, 2);
//     NAPI_ARGV_INT32(legCount, 3);
//     NAPI_ARGV_UTF8(waypointName, waypoint_name_size, 4);

//     std::vector<std::string> classes = {};

//     napi_value buffers = argv[5];
//     NAPI_FOR_EACH(buffers, buffer) {
//       NAPI_UTF8(tmp, 100, buffer);
//       classes.push_back(tmp);
//     }

//     rapidjson::Document document;
//     document.Parse(json);

//     std::string result;
//     OSRMTextInstructions* obj;
//     status = napi_unwrap(env, jsthis, reinterpret_cast<void**>(&obj));

//     try {
//       result = obj->compile(language, document, legIndex, legCount, waypointName, classes);
//     } catch (const std::exception& e) {
//       napi_throw_error(env, NULL, e.what());
//     }

//     NAPI_RETURN_STRING(result.c_str());
//   }

// private:
//   napi_env env_;
//   napi_ref wrapper_;
//   static napi_ref constructor;

//   explicit OSRMTextInstructions(const char* config)
//       : osrmti::OSRMTextInstructions(config), env_(nullptr), wrapper_(nullptr) {
//   }
//   ~OSRMTextInstructions() {
//     napi_delete_reference(env_, wrapper_);
//   }

//   static napi_value New(napi_env env, napi_callback_info info) {
//     NAPI_ARGV(1);
//     napi_status status;

//     size_t argv_version_size = get_size_utf8(env, argv[0]);
//     NAPI_ARGV_UTF8(argv_version, argv_version_size, 0);

//     napi_value cons;
//     status = napi_get_reference_value(env, constructor, &cons);
//     assert(status == napi_ok);

//     napi_value instance;
//     status = napi_new_instance(env, cons, argc, argv, &instance);
//     assert(status == napi_ok);

//     return instance;
//   }


// }; // OSRMTextInstructions

// } // namespace node_osrmti

// napi_ref node_osrmti::OSRMTextInstructions::constructor;

// napi_value Init(napi_env env, napi_value exports) {
//   napi_value new_exports;
//   napi_status status =
//       napi_create_function(env, "", NAPI_AUTO_LENGTH, node_osrmti::OSRMTextInstructions::Init, nullptr, &new_exports);
//   checkNapiStatus(status, env, "Failed to wrap init function");
//   return new_exports;
// }


// NAPI_MODULE(NODE_GYP_MODULE_NAME, Init);
