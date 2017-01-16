/**
 * Created by texpe on 14/01/2017.
 */

function connectService(service, disconnect = false) {
	window.open('/api/services/' + (disconnect ? 'dis' : '') + 'connect/' + service, 'UChat - ' + (disconnect ? 'Disconnecting' : 'Connecting') + ' service', 'width=800,height=600,location=0,centerscreen=yes,menubar=0,toolbar=0,status=0');
}

function popupActionComplete(e) {
	e();
	window.location.reload();
}