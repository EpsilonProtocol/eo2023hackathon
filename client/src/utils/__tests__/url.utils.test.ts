import { attachParams } from '../url.utils';

describe('url.utils', () => {
	it('attachParams should attach params to given url', () => {
		const url = attachParams('http://example.com', { param: 'test' });

		expect(url).toBe('http://example.com/?param=test');
	});
});
