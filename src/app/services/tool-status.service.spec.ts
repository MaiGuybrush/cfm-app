import { TestBed, inject } from '@angular/core/testing';

import { ToolStatusService } from './tool-status.service';

describe('ToolStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToolStatusService]
    });
  });

  it('should be created', inject([ToolStatusService], (service: ToolStatusService) => {
    expect(service).toBeTruthy();
  }));
});
