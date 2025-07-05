import { TicketController } from '../../../../src/components/ticket/ticket.controller';
import { ticketService } from '../../../../src/components/ticket/ticket.service';

jest.mock('../../../../src/components/ticket/ticket.service');

describe('TicketController', () => {
    let ticketController: TicketController;
    let req: any;
    let res: any;

    beforeEach(() => {
        ticketController = new TicketController();

        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return tickets successfully', async () => {
            (ticketService.getAllTickets as jest.Mock).mockResolvedValue(['ticket1', 'ticket2']);
            req.query = {};

            await ticketController.getAll(req, res);

            expect(ticketService.getAllTickets).toHaveBeenCalledWith({ eventId: undefined, userId: undefined, isScanned: undefined });
            expect(res.json).toHaveBeenCalledWith(['ticket1', 'ticket2']);
        });

        it('should handle service errors', async () => {
            (ticketService.getAllTickets as jest.Mock).mockRejectedValue(new Error('Database error'));
            req.query = {};

            await ticketController.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch tickets' });
        });
    });

    describe('getById', () => {
        it('should return ticket successfully', async () => {
            (ticketService.getTicketById as jest.Mock).mockResolvedValue({ id: 1 });
            req.params = { id: '1' };

            await ticketController.getById(req, res);

            expect(ticketService.getTicketById).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should return 400 for invalid ID', async () => {
            req.params = { id: 'invalid' };

            await ticketController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid ticket ID' });
        });

        it('should return 404 if ticket not found', async () => {
            (ticketService.getTicketById as jest.Mock).mockRejectedValue(new Error('Ticket not found'));
            req.params = { id: '1' };

            await ticketController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Ticket not found' });
        });
    });

    describe('create', () => {
        it('should create ticket successfully', async () => {
            (ticketService.createTicket as jest.Mock).mockResolvedValue({ id: 1 });
            req.body = { orderItemId: 1, userId: 1, eventId: 1, ticketTypeId: 1 };

            await ticketController.create(req, res);

            expect(ticketService.createTicket).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { orderItemId: 1, userId: 0, eventId: 1, ticketTypeId: 1 };

            await ticketController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Missing required ticket fields' });
        });

        it('should handle service errors', async () => {
            (ticketService.createTicket as jest.Mock).mockRejectedValue(new Error('Creation error'));
            req.body = { orderItemId: 1, userId: 1, eventId: 1, ticketTypeId: 1 };

            await ticketController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Creation error' });
        });
    });

    describe('scan', () => {
        it('should scan ticket successfully', async () => {
            (ticketService.scanTicket as jest.Mock).mockResolvedValue({ id: 1, isScanned: true });
            req.params = { id: '1' };
            req.body = { scannedByUser: 2 };

            await ticketController.scan(req, res);

            expect(ticketService.scanTicket).toHaveBeenCalledWith(1, 2);
            expect(res.json).toHaveBeenCalledWith({ id: 1, isScanned: true });
        });

        it('should return 400 for invalid IDs', async () => {
            req.params = { id: 'invalid' };
            req.body = { scannedByUser: 'invalid' };

            await ticketController.scan(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid ticket ID or scannedByUser' });
        });

        it('should handle service errors', async () => {
            (ticketService.scanTicket as jest.Mock).mockRejectedValue(new Error('Scan error'));
            req.params = { id: '1' };
            req.body = { scannedByUser: 2 };

            await ticketController.scan(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Scan error' });
        });
    });

    describe('delete', () => {
        it('should delete ticket successfully', async () => {
            (ticketService.deleteTicket as jest.Mock).mockResolvedValue({ id: 1 });
            req.params = { id: '1' };

            await ticketController.delete(req, res);

            expect(ticketService.deleteTicket).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should return 400 for invalid ID', async () => {
            req.params = { id: 'invalid' };

            await ticketController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid ticket ID' });
        });

        it('should handle service errors', async () => {
            (ticketService.deleteTicket as jest.Mock).mockRejectedValue(new Error('Delete error'));
            req.params = { id: '1' };

            await ticketController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Delete error' });
        });
    });
});
