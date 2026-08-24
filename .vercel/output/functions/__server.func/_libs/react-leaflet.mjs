import { o as __toESM } from "../_runtime.mjs";
import { b as require_react } from "./@radix-ui/react-accordion+[...].mjs";
import { a as createPathComponent, c as require_leaflet_src, d as createLeafletContext, f as extendContext, i as createOverlayComponent, l as withPane, m as updateCircle, n as updateGridLayer, o as createTileLayerComponent, p as useLeafletContext, r as createLayerComponent, s as createElementObject, t as updateMediaOverlay, u as LeafletContext } from "./leaflet+react-leaflet__core.mjs";
//#region node_modules/react-leaflet/lib/hooks.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function useMap() {
	return useLeafletContext().map;
}
//#endregion
//#region node_modules/react-leaflet/lib/CircleMarker.js
var import_leaflet_src = /* @__PURE__ */ __toESM(require_leaflet_src(), 1);
var CircleMarker = createPathComponent(function createCircleMarker({ center, children: _c, ...options }, ctx) {
	const marker = new import_leaflet_src.CircleMarker(center, options);
	return createElementObject(marker, extendContext(ctx, { overlayContainer: marker }));
}, updateCircle);
//#endregion
//#region node_modules/react-leaflet/lib/GeoJSON.js
var GeoJSON = createPathComponent(function createGeoJSON({ data, ...options }, ctx) {
	const geoJSON = new import_leaflet_src.GeoJSON(data, options);
	return createElementObject(geoJSON, extendContext(ctx, { overlayContainer: geoJSON }));
}, function updateGeoJSON(layer, props, prevProps) {
	if (props.style !== prevProps.style) {
		if (props.style == null) layer.resetStyle();
		else layer.setStyle(props.style);
	}
});
//#endregion
//#region node_modules/react-leaflet/lib/ImageOverlay.js
var ImageOverlay = createLayerComponent(function createImageOverlay({ bounds, url, ...options }, ctx) {
	const overlay = new import_leaflet_src.ImageOverlay(url, bounds, options);
	return createElementObject(overlay, extendContext(ctx, { overlayContainer: overlay }));
}, function updateImageOverlay(overlay, props, prevProps) {
	updateMediaOverlay(overlay, props, prevProps);
	if (props.bounds !== prevProps.bounds) {
		const bounds = props.bounds instanceof import_leaflet_src.LatLngBounds ? props.bounds : new import_leaflet_src.LatLngBounds(props.bounds);
		overlay.setBounds(bounds);
	}
	if (props.url !== prevProps.url) overlay.setUrl(props.url);
});
//#endregion
//#region node_modules/react-leaflet/lib/MapContainer.js
function MapContainerComponent({ bounds, boundsOptions, center, children, className, id, placeholder, style, whenReady, zoom, ...options }, forwardedRef) {
	const [props] = (0, import_react.useState)({
		className,
		id,
		style
	});
	const [context, setContext] = (0, import_react.useState)(null);
	const mapInstanceRef = (0, import_react.useRef)(void 0);
	(0, import_react.useImperativeHandle)(forwardedRef, () => context?.map ?? null, [context]);
	const mapRef = (0, import_react.useCallback)((node) => {
		if (node !== null && !mapInstanceRef.current) {
			const map = new import_leaflet_src.Map(node, options);
			mapInstanceRef.current = map;
			if (center != null && zoom != null) map.setView(center, zoom);
			else if (bounds != null) map.fitBounds(bounds, boundsOptions);
			if (whenReady != null) map.whenReady(whenReady);
			setContext(createLeafletContext(map));
		}
	}, []);
	(0, import_react.useEffect)(() => {
		return () => {
			context?.map.remove();
		};
	}, [context]);
	const contents = context ? /*#__PURE__*/ import_react.createElement(LeafletContext, { value: context }, children) : placeholder ?? null;
	return /*#__PURE__*/ import_react.createElement("div", {
		...props,
		ref: mapRef
	}, contents);
}
var MapContainer = /*#__PURE__*/ (0, import_react.forwardRef)(MapContainerComponent);
//#endregion
//#region node_modules/react-leaflet/lib/Polygon.js
var Polygon = createPathComponent(function createPolygon({ positions, ...options }, ctx) {
	const polygon = new import_leaflet_src.Polygon(positions, options);
	return createElementObject(polygon, extendContext(ctx, { overlayContainer: polygon }));
}, function updatePolygon(layer, props, prevProps) {
	if (props.positions !== prevProps.positions) layer.setLatLngs(props.positions);
});
//#endregion
//#region node_modules/react-leaflet/lib/Popup.js
var Popup = createOverlayComponent(function createPopup(props, context) {
	const popup = new import_leaflet_src.Popup(props, context.overlayContainer);
	return createElementObject(popup, context);
}, function usePopupLifecycle(element, context, { position }, setOpen) {
	(0, import_react.useEffect)(function addPopup() {
		const { instance } = element;
		function onPopupOpen(event) {
			if (event.popup === instance) {
				instance.update();
				setOpen(true);
			}
		}
		function onPopupClose(event) {
			if (event.popup === instance) setOpen(false);
		}
		context.map.on({
			popupopen: onPopupOpen,
			popupclose: onPopupClose
		});
		if (context.overlayContainer == null) {
			if (position != null) instance.setLatLng(position);
			instance.openOn(context.map);
		} else context.overlayContainer.bindPopup(instance);
		return function removePopup() {
			context.map.off({
				popupopen: onPopupOpen,
				popupclose: onPopupClose
			});
			context.overlayContainer?.unbindPopup();
			context.map.removeLayer(instance);
		};
	}, [
		element,
		context,
		setOpen,
		position
	]);
});
//#endregion
//#region node_modules/react-leaflet/lib/TileLayer.js
var TileLayer = createTileLayerComponent(function createTileLayer({ url, ...options }, context) {
	const layer = new import_leaflet_src.TileLayer(url, withPane(options, context));
	return createElementObject(layer, context);
}, function updateTileLayer(layer, props, prevProps) {
	updateGridLayer(layer, props, prevProps);
	const { url } = props;
	if (url != null && url !== prevProps.url) layer.setUrl(url);
});
//#endregion
export { ImageOverlay as a, useMap as c, MapContainer as i, Popup as n, GeoJSON as o, Polygon as r, CircleMarker as s, TileLayer as t };
