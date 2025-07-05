import { CustomerSupportController } from '../../../../src/components/customerSupport/customerSupport.controller';
import { customerSupportService } from '../../../../src/components/customerSupport/customerSupport.service';

jest.mock('../../../../src/components/customerSupport/customerSupport.service');

const mockRequest = (data: any = {}) => ({
    body: data.body || {},
    params: data.params || {}
}) as any;

const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('CustomerSupportController', () => {
    const controller = new CustomerSupportController();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return all tickets', async () => {
            const req = mockRequest();
            const res = mockResponse();
            (customerSupportService.getAll as jest.Mock).mockResolvedValue([{ id: 1 }]);

            await controller.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('should return message if no tickets found', async () => {
            const req = mockRequest();
            const res = mockResponse();
            (customerSupportService.getAll as jest.Mock).mockResolvedValue([]);

            await controller.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'No support tickets found.' });
        });

        it('should handle service errors', async () => {
            const req = mockRequest();
            const res = mockResponse();
            (customerSupportService.getAll as jest.Mock).mockRejectedValue(new Error('DB error'));

            await controller.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Failed to fetch support tickets',
                error: 'DB error'
            });
        });
    });

    describe('getById', () => {
        it('should return ticket by ID', async () => {
            const req = mockRequest({ params: { id: '1' } });
            const res = mockResponse();
            (customerSupportService.getById as jest.Mock).mockResolvedValue({ id: 1 });

            await controller.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should return message if ticket not found', async () => {
            const req = mockRequest({ params: { id: '99' } });
            const res = mockResponse();
            (customerSupportService.getById as jest.Mock).mockResolvedValue(null);

            await controller.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Support ticket not found' });
        });

        it('should return error for invalid ID', async () => {
            const req = mockRequest({ params: { id: 'abc' } });
            const res = mockResponse();

            await controller.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid ticket ID' });
        });

        it('should handle service errors', async () => {
            const req = mockRequest({ params: { id: '1' } });
            const res = mockResponse();
            (customerSupportService.getById as jest.Mock).mockRejectedValue(new Error('DB error'));

            await controller.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Failed to fetch support ticket',
                error: 'DB error'
            });
        });
    });

    describe('create', () => {
        it('should create a ticket successfully', async () => {
            const req = mockRequest({ body: { issue: 'Test issue' } });
            const res = mockResponse();
            (customerSupportService.create as jest.Mock).mockResolvedValue({ id: 1, issue: 'Test issue' });

            await controller.create(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 1, issue: 'Test issue' });
        });

        it('should handle service errors', async () => {
            const req = mockRequest({ body: { issue: 'Test issue' } });
            const res = mockResponse();
            (customerSupportService.create as jest.Mock).mockRejectedValue(new Error('DB error'));

            await controller.create(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Failed to create support ticket',
                error: 'DB error'
            });
        });
    });

    describe('update', () => {
        it('should update ticket successfully', async () => {
            const req = mockRequest({ params: { id: '1' }, body: { issue: 'Updated issue' } });
            const res = mockResponse();
            (customerSupportService.update as jest.Mock).mockResolvedValue({ id: 1, issue: 'Updated issue' });

            await controller.update(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 1, issue: 'Updated issue' });
        });

        it('should return message if ticket not found', async () => {
            const req = mockRequest({ params: { id: '99' }, body: { issue: 'Update attempt' } });
            const res = mockResponse();
            (customerSupportService.update as jest.Mock).mockResolvedValue(null);

            await controller.update(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Support ticket not found' });
        });

        it('should return error for invalid ID', async () => {
            const req = mockRequest({ params: { id: 'abc' }, body: { issue: 'Update attempt' } });
            const res = mockResponse();

            await controller.update(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid ticket ID' });
        });

        it('should handle service errors', async () => {
            const req = mockRequest({ params: { id: '1' }, body: { issue: 'Update fail' } });
            const res = mockResponse();
            (customerSupportService.update as jest.Mock).mockRejectedValue(new Error('DB error'));

            await controller.update(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Failed to update support ticket',
                error: 'DB error'
            });
        });
    });

    describe('delete', () => {
        it('should delete ticket successfully', async () => {
            const req = mockRequest({ params: { id: '1' } });
            const res = mockResponse();
            (customerSupportService.delete as jest.Mock).mockResolvedValue({ id: 1 });

            await controller.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Support ticket deleted successfully',
                ticket: { id: 1 }
            });
        });

        it('should return message if ticket not found', async () => {
            const req = mockRequest({ params: { id: '99' } });
            const res = mockResponse();
            (customerSupportService.delete as jest.Mock).mockResolvedValue(null);

            await controller.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Support ticket not found' });
        });

        it('should return error for invalid ID', async () => {
            const req = mockRequest({ params: { id: 'abc' } });
            const res = mockResponse();

            await controller.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid ticket ID' });
        });

        it('should handle service errors', async () => {
            const req = mockRequest({ params: { id: '1' } });
            const res = mockResponse();
            (customerSupportService.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

            await controller.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Failed to delete support ticket',
                error: 'DB error'
            });
        });
    });
});
