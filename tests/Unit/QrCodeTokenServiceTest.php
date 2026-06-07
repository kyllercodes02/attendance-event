<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\QrCodeTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QrCodeTokenServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_retries_until_it_generates_a_unique_token(): void
    {
        User::factory()->create([
            'qr_token' => str_repeat('a', 64),
        ]);

        $service = new class extends QrCodeTokenService
        {
            /**
             * @var list<string>
             */
            private array $candidates = [];

            public function __construct()
            {
                $this->candidates = [
                    str_repeat('a', 64),
                    str_repeat('b', 64),
                ];
            }

            protected function generateCandidateToken(): string
            {
                return array_shift($this->candidates);
            }
        };

        $token = $service->generateUniqueToken();

        $this->assertSame(str_repeat('b', 64), $token);
    }
}
