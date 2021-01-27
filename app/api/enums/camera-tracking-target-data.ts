export enum CameraTrackingTargetData {
	CAMERA_TRACKING_TARGET_NONE = 0, // No target data
	CAMERA_TRACKING_TARGET_EMBEDDED = 1, // Target data embedded in image data (proprietary)
	CAMERA_TRACKING_TARGET_RENDERED = 2, // Target data rendered in image
	CAMERA_TRACKING_TARGET_IN_STATUS = 4, // Target data within status message (Point or Rectangle)
	CAMERA_TRACKING_TARGET_DATA_ENUM_END = 5, // 
}